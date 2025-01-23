import {randomUUID} from 'node:crypto'
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import {toHaveReceivedCommand} from 'aws-sdk-client-mock-vitest'
import {
  DomainEvent,
  DomainEventName,
} from '../../src/domain/entities/domainEvent'
import {EventRepositoryErrorCode} from '../../src/domain/repositories/iEventRepository'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)

describe('EventDdbRepository.saveEvent', () => {
  afterEach(() => {
    ddbMock.reset()
  })
  describe('Given an event does not exist', () => {
    beforeEach(() => {
      ddbMock.on(QueryCommand).resolves({})
      ddbMock.on(PutCommand).resolves({})
    })
    it('saves the event', async () => {
      const event = new DomainEvent({
        aggregateId: randomUUID(),
        createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
        name: DomainEventName.WidgetCreated,
        payload: {name: 'WidgetCreated'},
        version: 1,
      })
      const repository = new EventDdbRepository()
      await expect(repository.saveEvent(event)).resolves.toBeUndefined()
    })
  })
  describe('Given an event exists', () => {
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
    it('throws an error, EventAlreadyExists', async () => {
      const repository = new EventDdbRepository()
      await expect(repository.saveEvent(event)).rejects.toThrow(
        EventRepositoryErrorCode.EventAlreadyExists,
      )
    })
    it('does not save the event', async () => {
      const repository = new EventDdbRepository()
      expect(ddbMock).not.toHaveReceivedCommand(PutCommand)
    })
  })
  describe('Given an event which version is lower than the existing event', () => {
    const event = new DomainEvent({
      aggregateId: randomUUID(),
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      name: DomainEventName.WidgetCreated,
      payload: {name: 'WidgetCreated'},
      version: 1,
    })
    const existingEvent = new DomainEvent({
      aggregateId: event.aggregateId,
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      name: DomainEventName.WidgetCreated,
      payload: {name: 'WidgetCreated'},
      version: 2,
    })
    beforeEach(() => {
      ddbMock.on(QueryCommand).resolves({
        Items: [
          {
            PK: existingEvent.aggregateId,
            SK: existingEvent.version,
            created: existingEvent.createdAt,
            name: existingEvent.name,
            payload: existingEvent.payload,
          },
        ],
      })
    })
    it('throws an error, EventAlreadyExists', async () => {
      const repository = new EventDdbRepository()
      await expect(repository.saveEvent(event)).rejects.toThrow(
        EventRepositoryErrorCode.EventAlreadyExists,
      )
    })
    it('does not save the event', async () => {
      const repository = new EventDdbRepository()
      expect(ddbMock).not.toHaveReceivedCommand(PutCommand)
    })
  })
})
