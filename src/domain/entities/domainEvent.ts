export const DomainEventName = {
  WidgetCreated: 'WidgetCreated',
  WidgetNameChanged: 'WidgetNameChanged',
  WidgetDescriptionChanged: 'WidgetDescriptionChanged',
  WidgetDeleted: 'WidgetDeleted',
} as const
export type DomainEventName =
  (typeof DomainEventName)[keyof typeof DomainEventName]

export interface DomainEventProps {
  aggregateId: string
  version: number
  createdAt: string
  name: DomainEventName
  payload: any
}

export class DomainEvent {
  public readonly aggregateId: string
  public readonly version: number
  public readonly createdAt: string
  public readonly name: DomainEventName
  public readonly payload: any

  constructor(props: DomainEventProps) {
    this.aggregateId = props.aggregateId
    this.version = props.version
    this.createdAt = props.createdAt
    this.name = props.name
    this.payload = props.payload
  }
}
