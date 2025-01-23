import {randomUUID} from 'node:crypto'
import {DynamoDBDocumentClient, QueryCommand} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import {
  DomainEvent,
  DomainEventName,
} from '../../src/domain/entities/domainEvent'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)

describe('EventDdbRepository.getEventsByAggregateId', () => {
  afterEach(() => {
    ddbMock.reset()
  })
  describe('Given no events exist for the aggregateId', () => {
    beforeEach(() => {
      ddbMock.on(QueryCommand).resolves({})
    })
    it('returns an empty array', async () => {
      const repository = new EventDdbRepository()
      const aggregateId = randomUUID()
      const result = await repository.getEventsByAggregateId(aggregateId)
      expect(result).toEqual([])
    })
  })
  describe('Given an event exists for the aggregateId', () => {
    const event = new DomainEvent({
      aggregateId: randomUUID(),
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      name: DomainEventName.WidgetCreated,
      payload: {name: 'WidgetCreated'},
      version: 1,
    })
    beforeEach(() => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          {
            PK: event.aggregateId,
            SK: event.version,
            created: event.createdAt,
            name: event.name,
            payload: event.payload,
          },
        ],
      })
    })
    it('returns an array with the event', async () => {
      const repository = new EventDdbRepository()
      const result = await repository.getEventsByAggregateId(event.aggregateId)
      expect(result).toEqual([event])
    })
  })
  describe('Given an error occurs', () => {
    beforeEach(() => {
      ddbMock.on(QueryCommand).rejects(new Error('Error occurred'))
    })
    it('throws an error', async () => {
      const repository = new EventDdbRepository()
      const aggregateId = randomUUID()
      await expect(
        repository.getEventsByAggregateId(aggregateId),
      ).rejects.toThrow('Error occurred')
    })
  })
})
