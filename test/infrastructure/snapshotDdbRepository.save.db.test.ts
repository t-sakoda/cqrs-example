import {randomUUID} from 'node:crypto'
import {ConditionalCheckFailedException} from '@aws-sdk/client-dynamodb'
import {
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

describe('SnapshotDdbRepository.saves', () => {
  describe('Given the snapshot does not exist', () => {
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
    it('saves a new snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).resolves.toBeUndefined()
    })
  })

  describe('Given the snapshot exists and the version is greater than the existing snapshot', () => {
    const aggregateId = randomUUID()
    const existingSnapshot = new Snapshot({
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
    const snapshot = new Snapshot({
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
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: existingSnapshot.aggregateId,
          SK: existingSnapshot.version,
          created: existingSnapshot.createdAt,
          payload: existingSnapshot.payload,
          event_number: existingSnapshot.eventNumber,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: existingSnapshot.aggregateId,
          SK: existingSnapshot.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('saves a new snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).resolves.toBeUndefined()
    })
  })

  // バージョンが既存のアイテムのバージョンと等しい場合、新しいスナップショットを保存しない
  describe('Given the snapshot exists and the version is equal to the existing snapshot', () => {
    const aggregateId = randomUUID()
    const existingSnapshot = new Snapshot({
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
    const snapshot = new Snapshot({
      aggregateId,
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    })
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: existingSnapshot.aggregateId,
          SK: existingSnapshot.version,
          created: existingSnapshot.createdAt,
          payload: existingSnapshot.payload,
          event_number: existingSnapshot.eventNumber,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: existingSnapshot.aggregateId,
          SK: existingSnapshot.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('does not save a new snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).rejects.toThrow(
        SnapshotRepositoryErrorCode.SnapshotVersionNotNewer,
      )
    })
  })
  // バージョンが既存のアイテムのバージョンよりも小さい場合、新しいスナップショットを保存しない
  describe('Given the snapshot exists and the version is less than the existing snapshot', () => {
    const aggregateId = randomUUID()
    const existingSnapshot = new Snapshot({
      aggregateId,
      version: 2,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 4,
      },
      eventNumber: 2,
    })
    const snapshot = new Snapshot({
      aggregateId,
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    })
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: existingSnapshot.aggregateId,
          SK: existingSnapshot.version,
          created: existingSnapshot.createdAt,
          payload: existingSnapshot.payload,
          event_number: existingSnapshot.eventNumber,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: existingSnapshot.aggregateId,
          SK: existingSnapshot.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('does not save a new snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).rejects.toThrow(
        SnapshotRepositoryErrorCode.SnapshotVersionNotNewer,
      )
    })
  })
})
