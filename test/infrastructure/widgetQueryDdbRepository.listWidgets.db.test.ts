import {randomUUID} from 'node:crypto'
import {
  BatchWriteCommand,
  type BatchWriteCommandInput,
} from '@aws-sdk/lib-dynamodb'
import type {WidgetDTO} from '../../src/application/dto/widgetDTO'
import {AggregateType} from '../../src/domain/entities/aggregate'
import {DomainEventName} from '../../src/domain/entities/domainEvent'
import {ddbDocClient} from '../../src/infrastructure/ddbDocClient'
import {EventDdbRepository} from '../../src/infrastructure/eventDdbRepository'
import {SnapshotDdbRepository} from '../../src/infrastructure/snapshotDdbRepository'
import {WidgetQueryDdbRepository} from '../../src/infrastructure/widgetQueryDdbRepository'

const TABLE_NAME_AGGREGATE = 'Aggregate'

describe('WidgetQueryDdbRepository.listWidgets', () => {
  const eventRepository = new EventDdbRepository()
  const snapshotRepository = new SnapshotDdbRepository()
  const repository = new WidgetQueryDdbRepository({
    eventRepository,
    snapshotRepository,
  })

  describe('Given no widgets', () => {
    it('returns an empty array', async () => {
      const widgets = await repository.listWidgets()
      expect(widgets).toEqual([])
    })
  })

  describe('Given some widgets', () => {
    const aggregateId1 = randomUUID()
    const aggregateId2 = randomUUID()
    const repository = new WidgetQueryDdbRepository({
      eventRepository,
      snapshotRepository,
    })
    beforeEach(() => {
      const input: BatchWriteCommandInput = {
        RequestItems: {
          [TABLE_NAME_AGGREGATE]: [
            {
              PutRequest: {
                Item: {
                  PK: aggregateId1,
                  created: new Date('2022-01-01T00:00:00.000Z').toISOString(),
                  type: AggregateType.Widget,
                  last_events: {
                    1: {
                      created: new Date(
                        '2022-01-01T00:00:00.000Z',
                      ).toISOString(),
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
              },
            },
            {
              PutRequest: {
                Item: {
                  PK: aggregateId2,
                  created: new Date('2022-01-02T00:00:00.000Z').toISOString(),
                  type: AggregateType.Widget,
                  last_events: {
                    1: {
                      created: new Date(
                        '2022-01-02T00:00:00.000Z',
                      ).toISOString(),
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
              },
            },
          ],
        },
      }
      const command = new BatchWriteCommand(input)
      ddbDocClient.send(command)
    })
    it('returns the widgets', async () => {
      const widgets = await repository.listWidgets()
      const expectedWidgets: WidgetDTO[] = [
        {
          aggregateId: aggregateId1,
          createdAt: new Date('2022-01-01T00:00:00.000Z').toISOString(),
          type: AggregateType.Widget,
          name: 'Widget 1',
          description: 'Description 1',
          stock: 1,
        },
        {
          aggregateId: aggregateId2,
          createdAt: new Date('2022-01-02T00:00:00.000Z').toISOString(),
          type: AggregateType.Widget,
          name: 'Widget 2',
          description: 'Description 2',
          stock: 2,
        },
      ]
      const result = widgets.sort((a, b) =>
        (a.aggregateId ?? '').localeCompare(b.aggregateId ?? ''),
      )
      const expected = expectedWidgets.sort((a, b) =>
        (a.aggregateId ?? '').localeCompare(b.aggregateId ?? ''),
      )
      expect(result).toEqual(expected)
    })
  })
})
