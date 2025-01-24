import {Domain} from 'node:domain'
import {
  type DynamoDBDocument,
  type DynamoDBDocumentClient,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {DomainEvent} from '../domain/entities/domainEvent'
import {
  EventRepositoryErrorCode,
  type IEventRepository,
} from '../domain/repositories/iEventRepository'
import {ddbDocClient} from './ddbDocClient'

const TABLE_NAME = 'Event'

export class EventDdbRepository implements IEventRepository {
  private readonly tableName: string
  private readonly ddbDocClient: DynamoDBDocument

  constructor() {
    this.tableName = TABLE_NAME
    this.ddbDocClient = ddbDocClient
  }

  async getEventsByAggregateId(aggregateId: string): Promise<DomainEvent[]> {
    const input: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :aggregateId',
      ExpressionAttributeValues: {
        ':aggregateId': aggregateId,
      },
    }
    const command = new QueryCommand(input)
    const result = await this.ddbDocClient.send(command)

    if (!result.Items) {
      return []
    }

    const events = result.Items.map((item) => {
      return new DomainEvent({
        aggregateId: item.PK,
        createdAt: item.created,
        name: item.name,
        payload: item.payload,
        version: item.SK,
      })
    })
    return events
  }

  async saveEvent(event: DomainEvent): Promise<void> {
    const existingEvents = await this.getEventsByAggregateId(event.aggregateId)
    if (existingEvents.some((e) => e.version >= event.version)) {
      throw new Error(EventRepositoryErrorCode.EventAlreadyExists)
    }

    const input: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: event.aggregateId,
        SK: event.version,
        created: event.createdAt,
        name: event.name,
        payload: event.payload,
      },
      ConditionExpression: 'attribute_not_exists(PK) OR SK < :newVersion',
      ExpressionAttributeValues: {
        ':newVersion': event.version,
      },
    }
    const command = new PutCommand(input)
    await this.ddbDocClient.send(command)
  }
}
