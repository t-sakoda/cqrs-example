import {type DomainEvent, DomainEventName} from './domainEvent'
import type {Snapshot} from './snapshot'

export const WidgetError = {
  AggregateIdNotSet: 'AggregateIdNotSet',
  AggregateIdAlreadySet: 'AggregateIdAlreadySet',
  AggregateIdMismatch: 'AggregateIdMismatch',
} as const
export type WidgetError = (typeof WidgetError)[keyof typeof WidgetError]

export class Widget {
  private _aggregateId?: string
  private _createdAt?: string
  private _name?: string
  private _description?: string
  private _stock?: number

  get aggregateId(): string | undefined {
    return this._aggregateId
  }

  get createdAt(): string | undefined {
    return this._createdAt
  }

  get name(): string | undefined {
    return this._name
  }

  get description(): string | undefined {
    return this._description
  }

  get stock(): number | undefined {
    return this._stock
  }

  applySnapshot(snapshot: Snapshot) {
    if (this._aggregateId) {
      throw new Error(WidgetError.AggregateIdAlreadySet)
    }
    this._aggregateId = snapshot.aggregateId
    this._createdAt = snapshot.payload.createdAt
    this._name = snapshot.payload.name
    this._description = snapshot.payload.description
    this._stock = snapshot.payload.stock
  }

  applyEvent(event: DomainEvent) {
    if (!this._aggregateId) {
      throw new Error(WidgetError.AggregateIdNotSet)
    }
    if (this._aggregateId !== event.aggregateId) {
      throw new Error(WidgetError.AggregateIdMismatch)
    }
    switch (event.name) {
      case DomainEventName.WidgetCreated:
        this._aggregateId = event.aggregateId
        this._createdAt = event.createdAt
        this._name = event.payload.name
        this._description = event.payload.description
        this._stock = event.payload.stock
        break
      case DomainEventName.WidgetNameChanged:
        this._name = event.payload.name
        break
      case DomainEventName.WidgetDescriptionChanged:
        this._description = event.payload.description
        break
      case DomainEventName.WidgetStockUpdated:
        this._stock = event.payload.stock
        break
      case DomainEventName.WidgetDeleted:
        this._aggregateId = undefined
        this._createdAt = undefined
        this._name = undefined
        this._description = undefined
        this._stock = undefined
        break
      default:
      // Ignore events that are not relevant to this aggregate
    }
  }
}
