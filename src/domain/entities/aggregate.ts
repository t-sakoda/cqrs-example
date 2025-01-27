import type {DomainEvent} from './domainEvent'

export const AggregateType = {
  Widget: 'Widget',
} as const
export type AggregateType = (typeof AggregateType)[keyof typeof AggregateType]

export interface AggregateProps {
  aggregateId: string
}

export class Aggregate {
  readonly aggregateId: string
  private _version?: number
  private _createdAt?: string
  private _lastEvents?: Record<number, DomainEvent>
  private _type?: AggregateType

  constructor(props: AggregateProps) {
    this.aggregateId = props.aggregateId
  }

  get version() {
    return this._version
  }

  get createdAt() {
    return this._createdAt
  }

  get lastEvents() {
    return this._lastEvents
  }

  get type() {
    return this._type
  }

  applyEvent(event: DomainEvent) {
    throw new Error('Method not implemented.')
  }
}
