import {randomUUID} from 'node:crypto'
import {Domain} from 'node:domain'
import {ResourceNotFoundException} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocumentClient, GetCommand} from '@aws-sdk/lib-dynamodb'
import {mockClient} from 'aws-sdk-client-mock'
import type {WidgetDTO} from '../../src/application/dto/widgetDTO'
import {Aggregate, AggregateType} from '../../src/domain/entities/aggregate'
import {
  DomainEvent,
  DomainEventName,
} from '../../src/domain/entities/domainEvent'
import {WidgetQueryRepositoryErrorCode} from '../../src/domain/repositories/iWidgetQueryRepository'
import {WidgetQueryDdbRepository} from '../../src/infrastructure/widgetQueryDdbRepository'
import {mockEventRepository} from './mock/mockEventRepository'
import {mockSnapshotRepository} from './mock/mockSnapshotRepository'

const ddbMock = mockClient(DynamoDBDocumentClient)
const eventRepository = mockEventRepository()
const snapshotRepository = mockSnapshotRepository()

describe('WidgetQueryDdbRepository.getWidgetById', () => {
  afterEach(() => {
    ddbMock.reset()
  })
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
  describe('Given an error when getting the widget aggregate', () => {
    const aggregateId = randomUUID()
    beforeEach(() => {
      ddbMock.on(GetCommand).rejects(new Error('Unknown error'))
    })
    it('throws AggregateNotFound error', async () => {
      await expect(repository.getWidgetById(aggregateId)).rejects.toThrow(
        WidgetQueryRepositoryErrorCode.InternalError,
      )
    })
  })

  describe('Given a widget aggregate', () => {
    const aggregateId = randomUUID()
    const createdAt = new Date('2025-02-01T12:34:56.789Z').toISOString()
    beforeEach(() => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          PK: aggregateId,
          created: createdAt,
          type: AggregateType.Widget,
          last_events: {
            1: {
              createdAt,
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
      })
      eventRepository.getEventsByAggregateId = vi.fn().mockResolvedValue([
        new DomainEvent({
          aggregateId,
          createdAt,
          name: DomainEventName.WidgetCreated,
          payload: {
            name: 'Widget 1',
            description: 'Description 1',
            stock: 10,
          },
          version: 1,
        }),
      ])
    })
    it('returns the widget DTO', async () => {
      const widget = await repository.getWidgetById(aggregateId)
      const expected: WidgetDTO = {
        aggregateId,
        createdAt,
        type: AggregateType.Widget,
        name: 'Widget 1',
        description: 'Description 1',
        stock: 10,
      }
      expect(widget).toEqual(expected)
    })
  })
})
