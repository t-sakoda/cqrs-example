import type {DomainEvent} from '../entities/domainEvent'

export const EventRepositoryErrorCode = {
  EventAlreadyExists: 'EventAlreadyExists',
} as const
export type EventRepositoryErrorCode =
  (typeof EventRepositoryErrorCode)[keyof typeof EventRepositoryErrorCode]

export interface IEventRepository {
  getEventsByAggregateId(aggregateId: string): Promise<DomainEvent[]>
  saveEvent(event: DomainEvent): Promise<void>
}
