import {randomUUID} from 'node:crypto'
import {Delete} from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  DeleteCommand,
  type DeleteCommandInput,
  PutCommand,
  type PutCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {
  DomainEvent,
  DomainEventName,
} from '../../src/domain/entities/domainEvent'
import {ddbDocClient} from '../../src/infrastructure/ddbDocClient'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'

const TABLE_NAME = 'Event'

describe('EventDdbRepository.getEventsByAggregateId', () => {
  describe('Given no events exist for the aggregateId', () => {
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
    afterEach(() => {
      const input: DeleteCommandInput = {
        TableName: TABLE_NAME,
        Key: {
          PK: event.aggregateId,
          SK: event.version,
        },
      }
      const command = new DeleteCommand(input)
      return ddbDocClient.send(command)
    })
    it('returns an array of events', async () => {
      const repository = new EventDdbRepository()
      await repository.saveEvent(event)
      const result = await repository.getEventsByAggregateId(event.aggregateId)
      expect(result).toEqual([event])
    })
  })

  describe('Given multiple events exist for the aggregateId', () => {
    const aggregateId = randomUUID()
    const events = [
      new DomainEvent({
        aggregateId,
        createdAt: new Date('2025-01-01T12:34:56.789Z').toISOString(),
        name: DomainEventName.WidgetCreated,
        payload: {name: 'WidgetCreated'},
        version: 1,
      }),
      new DomainEvent({
        aggregateId,
        createdAt: new Date('2025-01-02T12:34:56.789Z').toISOString(),
        name: DomainEventName.WidgetNameChanged,
        payload: {name: 'WidgetNameChanged'},
        version: 2,
      }),
      new DomainEvent({
        aggregateId,
        createdAt: new Date('2025-01-03T12:34:56.789Z').toISOString(),
        name: DomainEventName.WidgetDescriptionChanged,
        payload: {name: 'WidgetDescriptionChanged'},
        version: 3,
      }),
      new DomainEvent({
        aggregateId,
        createdAt: new Date('2025-01-04T12:34:56.789Z').toISOString(),
        name: DomainEventName.WidgetDeleted,
        payload: {name: 'WidgetDeleted'},
        version: 4,
      }),
    ]
    beforeEach(async () => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          [TABLE_NAME]: events.map((event) => ({
            PutRequest: {
              Item: {
                PK: event.aggregateId,
                SK: event.version,
                created: event.createdAt,
                name: event.name,
                payload: event.payload,
              },
            },
          })),
        },
      }
      const command = new BatchWriteCommand(input)
      await ddbDocClient.send(command)
    })
    afterEach(() => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          [TABLE_NAME]: events.map((event) => ({
            DeleteRequest: {
              Key: {
                PK: event.aggregateId,
                SK: event.version,
              },
            },
          })),
        },
      }
      const command = new BatchWriteCommand(input)
      return ddbDocClient.send(command)
    })
    it('returns an array of events', async () => {
      const repository = new EventDdbRepository()
      const result = await repository.getEventsByAggregateId(aggregateId)
      expect(result).toEqual(events)
    })
  })
})
