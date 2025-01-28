import {randomUUID} from 'node:crypto'
import {Delete} from '@aws-sdk/client-dynamodb'
import {PutCommand, type PutCommandInput} from '@aws-sdk/lib-dynamodb'
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

describe('WidgetQueryDdbRepository.getWidgetById.db', () => {
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
          lastEvents: {
            1: {
              createdAt: createdAt,
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
})
