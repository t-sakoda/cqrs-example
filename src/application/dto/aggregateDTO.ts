import type {AggregateType} from '../../domain/entities/aggregate'

export interface AggregateDTOProps {
  aggregateId: string
  createdAt: string
  type: AggregateType
}

export abstract class AggregateDTO {
  readonly aggregateId: string
  readonly createdAt: string
  readonly type: AggregateType

  constructor(props: AggregateDTOProps) {
    this.aggregateId = props.aggregateId
    this.createdAt = props.createdAt
    this.type = props.type
  }
}
