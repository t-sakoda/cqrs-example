import type {AggregateDTO} from '../../application/dto/aggregateDTO'

export const AggregateQueryRepositoryErrorCode = {
  AggregateNotFound: 'AggregateNotFound',
  InternalError: 'InternalError',
} as const
export type AggregateQueryRepositoryErrorCode =
  (typeof AggregateQueryRepositoryErrorCode)[keyof typeof AggregateQueryRepositoryErrorCode]

export interface IAggregateQueryRepository {
  getAggregateById(aggregateId: string): Promise<AggregateDTO>
  listAggregates(): Promise<AggregateDTO[]>
}
