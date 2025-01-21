import type {DomainEvent} from '../entities/domainEvent'

export interface IEventRepository {
  getEventsByAggregateId(aggregateId: string): Promise<DomainEvent[]>
  saveEvent(event: DomainEvent): Promise<void>
}
