import {randomUUID} from 'node:crypto'
import {ConditionalCheckFailedException} from '@aws-sdk/client-dynamodb'
import {
  DeleteCommand,
  type DeleteCommandInput,
  PutCommand,
  type PutCommandInput,
  QueryCommand,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {
  DomainEvent,
  DomainEventName,
} from '../../src/domain/entities/domainEvent'
import {EventRepositoryErrorCode} from '../../src/domain/repositories/iEventRepository'
import {ddbDocClient} from '../../src/infrastructure/ddbDocClient'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'

const TABLE_NAME = 'Event'

describe('EventDdbRepository.saveEvent', () => {
  describe('Given an event does not exist', () => {
    const event = new DomainEvent({
      aggregateId: randomUUID(),
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      name: DomainEventName.WidgetCreated,
      payload: {name: 'WidgetCreated'},
      version: 1,
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: event.aggregateId,
          SK: event.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('saves the event', async () => {
      const repository = new EventDdbRepository()
      await repository.saveEvent(event)
      const result = await repository.getEventsByAggregateId(event.aggregateId)
      expect(result).toEqual([event])

      const input: QueryCommandInput = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :aggregateId',
        ExpressionAttributeValues: {
          ':aggregateId': event.aggregateId,
        },
      }
      const command = new QueryCommand(input)
      const queryResult = await ddbDocClient.send(command)
      expect(queryResult.Items).toEqual([
        {
          PK: event.aggregateId,
          SK: event.version,
          created: event.createdAt,
          name: event.name,
          payload: event.payload,
        },
      ])
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
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: event.aggregateId,
          SK: event.version,
          created: event.createdAt,
          name: event.name,
          payload: event.payload,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: event.aggregateId,
          SK: event.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('does not save the event', async () => {
      const repository = new EventDdbRepository()
      await expect(repository.saveEvent(event)).rejects.toThrowError(
        EventRepositoryErrorCode.EventAlreadyExists,
      )
    })
  })

  describe('Given an event with a larger version than the existing event is provided', () => {
    const eventVersion1 = new DomainEvent({
      aggregateId: randomUUID(),
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      name: DomainEventName.WidgetCreated,
      payload: {name: 'WidgetCreated'},
      version: 1,
    })
    const eventVersion2 = new DomainEvent({
      aggregateId: eventVersion1.aggregateId,
      createdAt: new Date('2025-01-02T12:34:57.789Z').toISOString(),
      name: DomainEventName.WidgetNameChanged,
      payload: {name: 'WidgetNameChanged'},
      version: 2,
    })
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: eventVersion1.aggregateId,
          SK: eventVersion1.version,
          created: eventVersion1.createdAt,
          name: eventVersion1.name,
          payload: eventVersion1.payload,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: eventVersion1.aggregateId,
          SK: eventVersion1.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('saves the event', async () => {
      const repository = new EventDdbRepository()
      expect(repository.saveEvent(eventVersion2)).resolves.toBeUndefined()
    })
  })

  describe('Given an event with a smaller version than the existing event is provided', () => {
    const eventVersion2 = new DomainEvent({
      aggregateId: randomUUID(),
      createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
      name: DomainEventName.WidgetCreated,
      payload: {name: 'WidgetCreated'},
      version: 2,
    })
    const eventVersion1 = new DomainEvent({
      aggregateId: eventVersion2.aggregateId,
      createdAt: new Date('2025-01-02T12:34:57.789Z').toISOString(),
      name: DomainEventName.WidgetNameChanged,
      payload: {name: 'WidgetNameChanged'},
      version: 1,
    })
    beforeEach(async () => {
      const input: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: {
          PK: eventVersion2.aggregateId,
          SK: eventVersion2.version,
          created: eventVersion2.createdAt,
          name: eventVersion2.name,
          payload: eventVersion2.payload,
        },
      }
      const command = new PutCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(async () => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: eventVersion2.aggregateId,
          SK: eventVersion2.version,
        },
      }
      const command = new DeleteCommand(input)
      await ddbDocClient.send(command)
    })
    it('does not save the event', async () => {
      const repository = new EventDdbRepository()
      await expect(repository.saveEvent(eventVersion1)).rejects.toThrowError(
        EventRepositoryErrorCode.EventAlreadyExists,
      )
    })
  })
})
