import {ResourceNotFoundException} from '@aws-sdk/client-dynamodb'
import {
  type DynamoDBDocument,
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
  ScanCommand,
  type ScanCommandInput,
  type ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb'
import {WidgetDTO} from '../application/dto/widgetDTO'
import {DomainEvent, type DomainEventName} from '../domain/entities/domainEvent'
import type {Snapshot} from '../domain/entities/snapshot'
import {Widget} from '../domain/entities/widget'
import type {IEventRepository} from '../domain/repositories/iEventRepository'
import {
  type ISnapshotRepository,
  SnapshotRepositoryErrorCode,
} from '../domain/repositories/iSnapshotRepository'
import {
  type IWidgetQueryRepository,
  WidgetQueryRepositoryErrorCode,
} from '../domain/repositories/iWidgetQueryRepository'
import {ddbDocClient} from './ddbDocClient'

const TABLE_NAME = 'Aggregate'

export interface WidgetQueryDdbRepositoryProps {
  eventRepository: IEventRepository
  snapshotRepository: ISnapshotRepository
}

export class WidgetQueryDdbRepository implements IWidgetQueryRepository {
  private readonly eventRepository: IEventRepository
  private readonly snapshotRepository: ISnapshotRepository
  private readonly tableName: string
  private readonly ddbDocClient: DynamoDBDocument

  constructor(props: WidgetQueryDdbRepositoryProps) {
    this.eventRepository = props.eventRepository
    this.snapshotRepository = props.snapshotRepository
    this.tableName = TABLE_NAME
    this.ddbDocClient = ddbDocClient
  }

  private async fromItemToDTO(
    item: Record<string, unknown>,
  ): Promise<WidgetDTO> {
    // lastEventsを取得
    const {PK: aggregateId, lastEvents} = item as {
      PK: string
      lastEvents: Record<number, unknown>
    }

    // lastEventsをEventテーブルに永続化
    for (const [version, _event] of Object.entries(lastEvents ?? {})) {
      const event = _event as {
        createdAt: string
        name: DomainEventName
        payload: Record<string, unknown>
      }
      await this.eventRepository.saveEvent(
        new DomainEvent({
          aggregateId,
          createdAt: event.createdAt,
          name: event.name,
          payload: event.payload,
          version: Number(version),
        }),
      )
    }

    const widget = new Widget({
      aggregateId,
    })

    // Snapshotテーブルから最新のスナップショットを取得
    let snapshot: Snapshot | undefined
    try {
      snapshot = await this.snapshotRepository.getLatestSnapshot(aggregateId)
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== SnapshotRepositoryErrorCode.SnapshotNotFound
      ) {
        throw error
      }
    }
    // スナップショットから復元
    if (snapshot) {
      widget.applySnapshot(snapshot)
    }

    // Eventテーブルから最新のスナップショットとの差分のイベントを再生
    let events: DomainEvent[]
    try {
      events = await this.eventRepository.getEventsByAggregateId(
        aggregateId,
        snapshot?.eventNumber ?? 0,
      )
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== WidgetQueryRepositoryErrorCode.WidgetNotFound
      ) {
        throw error
      }
      events = []
    }
    for (const event of events) {
      widget.applyEvent(event)
    }

    // DTOに変換
    return WidgetDTO.fromDomain(widget)
  }

  async getAggregateById(aggregateId: string): Promise<WidgetDTO> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        PK: aggregateId,
      },
    }
    const command = new GetCommand(input)
    let result: GetCommandOutput
    try {
      result = await this.ddbDocClient.send(command)
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new Error(WidgetQueryRepositoryErrorCode.WidgetNotFound)
      }
      throw new Error(WidgetQueryRepositoryErrorCode.InternalError)
    }

    if (!result.Item) {
      throw new Error(WidgetQueryRepositoryErrorCode.WidgetNotFound)
    }

    return this.fromItemToDTO(result.Item)
  }

  async listAggregates(): Promise<WidgetDTO[]> {
    const input: ScanCommandInput = {
      TableName: this.tableName,
    }
    const command = new ScanCommand(input)
    let result: ScanCommandOutput
    try {
      result = await this.ddbDocClient.send(command)
    } catch (error) {
      throw new Error(WidgetQueryRepositoryErrorCode.InternalError)
    }

    const {Items: items} = result
    if (!items) {
      return []
    }

    return Promise.all(items.map((item) => this.fromItemToDTO(item)))
  }

  async getWidgetById(aggregateId: string): Promise<WidgetDTO> {
    return this.getAggregateById(aggregateId)
  }

  async listWidgets(): Promise<WidgetDTO[]> {
    return this.listAggregates()
  }
}
