import type {Aggregate} from '../entities/aggregate'

export const AggregateCommandRepositoryErrorCode = {
  InternalError: 'InternalError',
} as const
export type AggregateCommandRepositoryErrorCode =
  (typeof AggregateCommandRepositoryErrorCode)[keyof typeof AggregateCommandRepositoryErrorCode]

export interface IAggregateCommandRepository {
  saveAggregate(aggregate: Aggregate): Promise<void>
  deleteAggregate(aggregateId: string): Promise<void>
}
