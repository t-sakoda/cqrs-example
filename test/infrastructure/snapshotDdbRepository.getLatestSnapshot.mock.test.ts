import {randomUUID} from 'node:crypto'
import {DynamoDBDocumentClient, QueryCommand} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import {SnapshotRepositoryErrorCode} from '../../src/domain/repositories/iSnapshotRepository'
import {SnapshotDdbRepository} from '../../src/infrastructure/snapshotDdbRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)

describe('SnapshotDdbRepository.getLatestSnapshot', () => {
  afterEach(() => {
    ddbMock.reset()
  })

  describe('Given the snapshot exists', () => {
    const aggregateId = randomUUID()
    const snapshot = {
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

    beforeEach(async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          {
            PK: snapshot.aggregateId,
            SK: snapshot.version,
            created: snapshot.createdAt,
            payload: snapshot.payload,
            event_number: snapshot.eventNumber,
          },
        ],
      })
    })

    it('returns the snapshot', async () => {
      const repository = new SnapshotDdbRepository()
      const result = await repository.getLatestSnapshot(aggregateId)
      expect(result).toEqual(snapshot)
    })
  })

  describe('Given the snapshot does not exist', () => {
    const aggregateId = randomUUID()
    beforeEach(async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [],
      })
    })
    it('throws an error', async () => {
      const repository = new SnapshotDdbRepository()
      await expect(repository.getLatestSnapshot(aggregateId)).rejects.toThrow(
        SnapshotRepositoryErrorCode.SnapshotNotFound,
      )
    })
  })
})
