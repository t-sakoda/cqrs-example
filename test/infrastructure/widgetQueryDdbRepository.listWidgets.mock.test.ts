import {randomUUID} from 'node:crypto'
import {DynamoDBDocumentClient, ScanCommand} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import type {WidgetDTO} from '../../src/application/dto/widgetDTO'
import {AggregateType} from '../../src/domain/entities/aggregate'
import {
  DomainEvent,
  DomainEventName,
} from '../../src/domain/entities/domainEvent'
import {WidgetQueryDdbRepository} from '../../src/infrastructure/widgetQueryDdbRepository'
import {mockEventRepository} from './mock/mockEventRepository'
import {mockSnapshotRepository} from './mock/mockSnapshotRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)
const eventRepository = mockEventRepository()
const snapshotRepository = mockSnapshotRepository()

describe('WidgetQueryDdbRepository.listWidgets', () => {
  afterEach(() => {
    ddbMock.reset()
  })
  const repository = new WidgetQueryDdbRepository({
    eventRepository,
    snapshotRepository,
  })
  describe('Given no widgets', () => {
    beforeEach(() => {
      ddbMock.on(ScanCommand).resolves({Items: []})
    })
    it('should return an empty array', async () => {
      const widgets = await repository.listWidgets()
      expect(widgets).toEqual([])
    })
  })

  describe('Given some widgets', () => {
    const aggregateId1 = randomUUID()
    const aggregateId2 = randomUUID()
    beforeEach(() => {
      ddbMock.on(ScanCommand).resolves({
        Items: [
          {
            PK: aggregateId1,
            created: new Date('2022-01-01T00:00:00.000Z').toISOString(),
            type: AggregateType.Widget,
            last_events: {
              1: {
                created: new Date('2022-01-01T00:00:00.000Z').toISOString(),
                name: DomainEventName.WidgetCreated,
                payload: {
                  name: 'Widget 1',
                  description: 'Description 1',
                  stock: 1,
                },
              },
            },
            version: 0,
          },
          {
            PK: aggregateId2,
            created: new Date('2022-01-02T00:00:00.000Z').toISOString(),
            type: AggregateType.Widget,
            last_events: {
              1: {
                created: new Date('2022-01-02T00:00:00.000Z').toISOString(),
                name: DomainEventName.WidgetCreated,
                payload: {
                  name: 'Widget 2',
                  description: 'Description 2',
                  stock: 2,
                },
              },
            },
            version: 0,
          },
        ],
      })
      eventRepository.getEventsByAggregateId = vi.fn(
        (aggregateId, _version) => {
          if (aggregateId === aggregateId1) {
            return Promise.resolve([
              new DomainEvent({
                aggregateId: aggregateId1,
                createdAt: new Date('2022-01-01T00:00:00.000Z').toISOString(),
                name: DomainEventName.WidgetCreated,
                payload: {
                  name: 'Widget 1',
                  description: 'Description 1',
                  stock: 1,
                },
                version: 1,
              }),
            ])
          }
          if (aggregateId === aggregateId2) {
            return Promise.resolve([
              new DomainEvent({
                aggregateId: aggregateId2,
                createdAt: new Date('2022-01-02T00:00:00.000Z').toISOString(),
                name: DomainEventName.WidgetCreated,
                payload: {
                  name: 'Widget 2',
                  description: 'Description 2',
                  stock: 2,
                },
                version: 1,
              }),
            ])
          }
          throw new Error('Unexpected aggregateId')
        },
      )
    })
    it('returns an array of widgets', async () => {
      const widgets = await repository.listWidgets()
      const expected: WidgetDTO[] = [
        {
          aggregateId: aggregateId1,
          createdAt: new Date('2022-01-01T00:00:00.000Z').toISOString(),
          name: 'Widget 1',
          description: 'Description 1',
          stock: 1,
          type: AggregateType.Widget,
        },
        {
          aggregateId: aggregateId2,
          createdAt: new Date('2022-01-02T00:00:00.000Z').toISOString(),
          name: 'Widget 2',
          description: 'Description 2',
          stock: 2,
          type: AggregateType.Widget,
        },
      ]
      expect(widgets).toEqual(expected)
    })
  })
})
