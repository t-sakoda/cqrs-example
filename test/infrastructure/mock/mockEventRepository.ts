import {DomainEvent} from '../../../src/domain/entities/domainEvent'
import type {IEventRepository} from '../../../src/domain/repositories/iEventRepository'

export const mockEventRepository = (): IEventRepository => ({
  saveEvent: vi.fn(),
  getEventsByAggregateId: vi.fn(),
})
