import {randomUUID} from 'node:crypto'
import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  DeleteCommand,
  type DeleteCommandInput,
  PutCommand,
  type PutCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {Snapshot} from '../../src/domain/entities/snapshot'
import {SnapshotRepositoryErrorCode} from '../../src/domain/repositories/iSnapshotRepository'
import {ddbDocClient} from '../../src/infrastructure/ddbDocClient'
import {SnapshotDdbRepository} from '../../src/infrastructure/snapshotDdbRepository'

const TABLE_NAME = 'Snapshot'

describe('SnapshotDdbRepository.getLatestSnapshot', () => {
  describe('Given the snapshot exists', () => {
    const aggregateId = randomUUID()
    const snapshot = new Snapshot({
      aggregateId,
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 4,
      },
      eventNumber: 2,
    })
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: snapshot.aggregateId,
          SK: snapshot.version,
          created: snapshot.createdAt,
          payload: snapshot.payload,
          event_number: snapshot.eventNumber,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: snapshot.aggregateId,
          SK: snapshot.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('returns the snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.getLatestSnapshot(aggregateId)).resolves.toEqual(
        snapshot,
      )
    })
  })

  describe('Given the snapshot does not exist', () => {
    const aggregateId = randomUUID()
    it('throws an error', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.getLatestSnapshot(aggregateId)).rejects.toThrow(
        SnapshotRepositoryErrorCode.SnapshotNotFound,
      )
    })
  })

  describe('Given multiple snapshots exist', () => {
    const aggregateId = randomUUID()
    const snapshot1 = new Snapshot({
      aggregateId,
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 4,
      },
      eventNumber: 2,
    })
    const snapshot2 = new Snapshot({
      aggregateId,
      version: 2,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    })
    const snapshots = [snapshot1, snapshot2]
    beforeEach(async () => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          [TABLE_NAME]: snapshots.map((snapshot) => ({
            PutRequest: {
              Item: {
                PK: snapshot.aggregateId,
                SK: snapshot.version,
                created: snapshot.createdAt,
                payload: snapshot.payload,
                event_number: snapshot.eventNumber,
              },
            },
          })),
        },
      }
      const command = new BatchWriteCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          [TABLE_NAME]: snapshots.map((snapshot) => ({
            DeleteRequest: {
              Key: {
                PK: snapshot.aggregateId,
                SK: snapshot.version,
              },
            },
          })),
        },
      }
      const command = new BatchWriteCommand(input)
      await ddbDocClient.send(command)
    })
    it('returns the latest snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      const snapshot = await repository.getLatestSnapshot(aggregateId)
      expect(snapshot).toEqual(snapshot2)
    })
  })
})
