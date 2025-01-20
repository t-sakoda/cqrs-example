export const AggregateType = {
  Widget: 'Widget',
} as const
export type AggregateType = (typeof AggregateType)[keyof typeof AggregateType]

export interface AggregateProps {
  aggregateId: string
  createdAt: string
  type: AggregateType
  lastEvents: any
  version: number
}

export abstract class Aggregate {
  readonly aggregateId: string
  readonly version: number
  readonly createdAt: string
  readonly lastEvents: any
  readonly type: AggregateType

  constructor(props: AggregateProps) {
    this.aggregateId = props.aggregateId
    this.createdAt = props.createdAt
    this.type = props.type
    this.lastEvents = props.lastEvents
    this.version = props.version
  }
}
