import {randomUUID} from 'node:crypto'
import {Delete, ResourceNotFoundException} from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  type PutCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import {AggregateType} from '../../src/domain/entities/aggregate'
import {DomainEventName} from '../../src/domain/entities/domainEvent'
import {WidgetQueryRepositoryErrorCode} from '../../src/domain/repositories/iWidgetQueryRepository'
import {ddbDocClient} from '../../src/infrastructure/ddbDocClient'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'
import {SnapshotDdbRepository} from '../../src/infrastructure/snapshotDdbRepository'
import {WidgetQueryDdbRepository} from '../../src/infrastructure/widgetQueryDdbRepository'
import {mockEventRepository} from './mock/mockEventRepository'
import {mockSnapshotRepository} from './mock/mockSnapshotRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)
const eventRepository = mockEventRepository()
const snapshotRepository = mockSnapshotRepository()

describe('WidgetQueryDdbRepository.getWidgetById', () => {
  const repository = new WidgetQueryDdbRepository({
    eventRepository,
    snapshotRepository,
  })
  describe('Given no widget aggregate', () => {
    const aggregateId = randomUUID()
    beforeEach(() => {
      ddbMock
        .on(GetCommand)
        .rejects(
          new ResourceNotFoundException({$metadata: {}, message: 'Not found'}),
        )
    })
    it('throws AggregateNotFound error', async () => {
      await expect(repository.getWidgetById(aggregateId)).rejects.toThrow(
        WidgetQueryRepositoryErrorCode.WidgetNotFound,
      )
    })
  })
})
