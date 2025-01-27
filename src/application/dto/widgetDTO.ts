import {AggregateType} from '../../domain/entities/aggregate'
import type {Widget} from '../../domain/entities/widget'
import {AggregateDTO} from './aggregateDTO'

export interface WidgetDTOProps {
  aggregateId?: string
  createdAt?: string
  name?: string
  description?: string
  stock?: number
}

export class WidgetDTO {
  readonly aggregateId?: string
  readonly createdAt?: string
  readonly name?: string
  readonly description?: string
  readonly stock?: number
  readonly type: AggregateType

  constructor(props: WidgetDTOProps) {
    this.aggregateId = props.aggregateId
    this.createdAt = props.createdAt
    this.name = props.name
    this.description = props.description
    this.stock = props.stock
    this.type = AggregateType.Widget
  }

  static fromDomain(widget: Widget): WidgetDTO {
    return new WidgetDTO({
      aggregateId: widget.aggregateId,
      createdAt: widget.createdAt,
      name: widget.name,
      description: widget.description,
      stock: widget.stock,
    })
  }
}
