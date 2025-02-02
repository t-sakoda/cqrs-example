import {randomUUID} from 'node:crypto'
import {Delete} from '@aws-sdk/client-dynamodb'
import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
  PutCommand,
  type PutCommandInput,
} from '@aws-sdk/lib-dynamodb'
import {AggregateType} from '../../src/domain/entities/aggregate'
import {DomainEventName} from '../../src/domain/entities/domainEvent'
import {WidgetQueryRepositoryErrorCode} from '../../src/domain/repositories/iWidgetQueryRepository'
import {ddbDocClient} from '../../src/infrastructure/ddbDocClient'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'
import {SnapshotDdbRepository} from '../../src/infrastructure/snapshotDdbRepository'
import {WidgetQueryDdbRepository} from '../../src/infrastructure/widgetQueryDdbRepository'

const eventRepository = new EventDdbRepository()
const snapshotRepository = new SnapshotDdbRepository()
const widgetQueryRepository = new WidgetQueryDdbRepository({
  eventRepository,
  snapshotRepository,
})

describe('WidgetQueryDdbRepository.getWidgetById', () => {
  describe('Given no widget aggregate', () => {
    const aggregateId = randomUUID()
    it('throws AggregateNotFound error', async () => {
      await expect(
        widgetQueryRepository.getWidgetById(aggregateId),
      ).rejects.toThrow(WidgetQueryRepositoryErrorCode.WidgetNotFound)
    })
  })

  describe('Given a first widget aggregate', () => {
    const aggregateId = randomUUID()
    const createdAt = new Date().toISOString()
    beforeEach(() => {
      const input: PutCommandInput = {
        TableName: 'Aggregate',
        Item: {
          PK: aggregateId,
          created: createdAt,
          type: AggregateType.Widget,
          last_events: {
            1: {
              created: createdAt,
              name: DomainEventName.WidgetCreated,
              payload: {
                name: 'Widget 1',
                description: 'Description 1',
                stock: 10,
              },
            },
          },
          version: 0,
        },
      }
      const command = new PutCommand(input)
      return ddbDocClient.send(command)
    })
    it('returns the widget DTO', async () => {
      const widget = await widgetQueryRepository.getWidgetById(aggregateId)
      expect(widget).toEqual({
        aggregateId,
        createdAt,
        name: 'Widget 1',
        description: 'Description 1',
        stock: 10,
        type: AggregateType.Widget,
      })
    })
  })

  describe('Given a widget aggregate with a snapshot', () => {
    const aggregateId = randomUUID()
    const createdAt1 = new Date('2025-01-01T12:34:56.789Z').toISOString()
    const createdAt2 = new Date('2025-01-02T12:34:56.789Z').toISOString()
    const createdAt3 = new Date('2025-01-02T12:34:56.789Z').toISOString()
    beforeEach(() => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          Aggregate: [
            {
              PutRequest: {
                Item: {
                  PK: aggregateId,
                  created: createdAt1,
                  type: AggregateType.Widget,
                  last_events: {
                    2: {
                      createdAt: createdAt3,
                      name: DomainEventName.WidgetNameChanged,
                      payload: {
                        name: 'Widget One',
                        description: 'Description 1',
                        stock: 10,
                      },
                    },
                  },
                  version: 1,
                },
              },
            },
          ],
          Snapshot: [
            {
              PutRequest: {
                Item: {
                  PK: aggregateId,
                  SK: 1,
                  created: createdAt2,
                  payload: {
                    created: createdAt1,
                    name: 'Widget 1',
                    description: 'Description 1',
                    stock: 10,
                    type: AggregateType.Widget,
                  },
                  event_number: 1,
                },
              },
            },
          ],
        },
      }
      const command = new BatchWriteCommand(input)
      return ddbDocClient.send(command)
    })
    it('returns the widget DTO', async () => {
      const widget = await widgetQueryRepository.getWidgetById(aggregateId)
      expect(widget).toEqual({
        aggregateId,
        createdAt: createdAt1,
        name: 'Widget One',
        description: 'Description 1',
        stock: 10,
        type: AggregateType.Widget,
      })
    })
  })

  describe('Given a widget aggregate with a snapshot and an event', () => {
    const aggregateId = randomUUID()
    const createdAt1 = new Date('2025-01-01T12:34:56.789Z').toISOString()
    const createdAt2 = new Date('2025-01-02T12:34:56.789Z').toISOString()
    const createdAt3 = new Date('2025-01-03T12:34:56.789Z').toISOString()
    beforeEach(() => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          Aggregate: [
            {
              PutRequest: {
                Item: {
                  PK: aggregateId,
                  created: createdAt1,
                  type: AggregateType.Widget,
                  last_events: {
                    3: {
                      created: createdAt3,
                      name: DomainEventName.WidgetDescriptionChanged,
                      payload: {
                        name: 'Widget One',
                        description: 'Description One',
                        stock: 10,
                      },
                    },
                  },
                  version: 2,
                },
              },
            },
          ],
          Event: [
            {
              PutRequest: {
                Item: {
                  PK: aggregateId,
                  SK: 1,
                  created: createdAt2,
                  name: DomainEventName.WidgetNameChanged,
                  payload: {
                    name: 'Widget One',
                    description: 'Description 1',
                    stock: 10,
                  },
                  version: 1,
                },
              },
            },
          ],
          Snapshot: [
            {
              PutRequest: {
                Item: {
                  PK: aggregateId,
                  SK: 1,
                  created: createdAt2,
                  payload: {
                    created: createdAt1,
                    name: 'Widget 1',
                    description: 'Description 1',
                    stock: 10,
                    type: AggregateType.Widget,
                  },
                  event_number: 1,
                },
              },
            },
          ],
        },
      }
      const command = new BatchWriteCommand(input)
      return ddbDocClient.send(command)
    })
    it('returns the widget DTO', async () => {
      const widget = await widgetQueryRepository.getWidgetById(aggregateId)
      expect(widget).toEqual({
        aggregateId,
        createdAt: createdAt1,
        name: 'Widget One',
        description: 'Description One',
        stock: 10,
        type: AggregateType.Widget,
      })
    })
  })
})
