import {
  type DynamoDBDocument,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {Snapshot} from '../domain/entities/snapshot'
import {
  type ISnapshotRepository,
  SnapshotRepositoryErrorCode,
} from '../domain/repositories/iSnapshotRepository'
import {ddbDocClient} from './ddbDocClient'

const TABLE_NAME = 'Snapshot'

export class SnapshotDdbRepository implements ISnapshotRepository {
  private readonly tableName: string
  private readonly ddbDocClient: DynamoDBDocument

  constructor() {
    this.tableName = TABLE_NAME
    this.ddbDocClient = ddbDocClient
  }

  async getLatestSnapshot(aggregateId: string): Promise<Snapshot> {
    const input: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :aggregateId',
      ExpressionAttributeValues: {
        ':aggregateId': aggregateId,
      },
      ScanIndexForward: false,
      Limit: 1,
    }
    const command = new QueryCommand(input)
    const result = await this.ddbDocClient.send(command)

    if (!result.Items || result.Items.length === 0) {
      throw new Error(SnapshotRepositoryErrorCode.SnapshotNotFound)
    }
    const {
      Items: [item],
    } = result
    const snapshot = new Snapshot({
      aggregateId: item.PK,
      version: item.SK,
      createdAt: item.created,
      payload: item.payload,
      eventNumber: item.event_number,
    })
    return snapshot
  }

  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    try {
      const latest = await this.getLatestSnapshot(snapshot.aggregateId)
      if (latest.version >= snapshot.version) {
        throw new Error(SnapshotRepositoryErrorCode.SnapshotVersionNotNewer)
      }
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== SnapshotRepositoryErrorCode.SnapshotNotFound
      ) {
        throw error
      }
    }

    const input: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        PK: snapshot.aggregateId,
        SK: snapshot.version,
        created: snapshot.createdAt,
        payload: snapshot.payload,
        event_number: snapshot.eventNumber,
      },
      ConditionExpression: 'attribute_not_exists(PK) OR SK < :newVersion',
      ExpressionAttributeValues: {
        ':newVersion': snapshot.version,
      },
    }
    const command = new PutCommand(input)
    await this.ddbDocClient.send(command)
  }
}
