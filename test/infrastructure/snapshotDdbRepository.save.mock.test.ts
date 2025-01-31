import {randomUUID} from 'node:crypto'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import {SnapshotRepositoryErrorCode} from '../../src/domain/repositories/iSnapshotRepository'
import {SnapshotDdbRepository} from '../../src/infrastructure/snapshotDdbRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)

describe('SnapshotDdbRepository.save', () => {
  afterEach(() => {
    ddbMock.reset()
  })

  describe('Given the snapshot exists and the version is equal to the existing snapshot', () => {
    const aggregateId = randomUUID()
    const existingSnapshot = {
      aggregateId,
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 4,
      },
      eventNumber: 2,
    }
    const snapshot = {
      aggregateId,
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    }

    beforeEach(async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          {
            PK: existingSnapshot.aggregateId,
            SK: existingSnapshot.version,
            created: existingSnapshot.createdAt,
            payload: existingSnapshot.payload,
            event_number: existingSnapshot.eventNumber,
          },
        ],
      })
    })

    it('does not save a new snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).rejects.toThrow(
        SnapshotRepositoryErrorCode.SnapshotVersionNotNewer,
      )
    })
  })

  describe('Given the snapshot does not exist', () => {
    const snapshot = {
      aggregateId: randomUUID(),
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    }

    beforeEach(async () => {
      ddbMock.on(QueryCommand).resolves({Items: []})
    })

    it('saves the new snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).resolves.toBeUndefined()
    })
  })

  describe('Given there is an error when saving the snapshot', () => {
    const snapshot = {
      aggregateId: randomUUID(),
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    }

    beforeEach(async () => {
      ddbMock.on(QueryCommand).resolves({Items: []})
      ddbMock.on(PutCommand).rejects(new Error('Failed to save snapshot'))
    })

    it('throws an error', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).rejects.toThrow(
        'Failed to save snapshot',
      )
    })
  })

  describe('Given there is an error when checking if the snapshot exists', () => {
    const snapshot = {
      aggregateId: randomUUID(),
      version: 1,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      payload: {
        widget_type: 'blueWidget',
        name: 'The awesome widget',
        in_stock: 10,
      },
      eventNumber: 3,
    }

    beforeEach(async () => {
      ddbMock
        .on(QueryCommand)
        .rejects(new Error('Failed to check if snapshot exists'))
    })

    it('throws an error', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.saveSnapshot(snapshot)).rejects.toThrow(
        'Failed to check if snapshot exists',
      )
    })
  })
})
