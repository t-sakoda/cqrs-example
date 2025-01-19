import type {Widget} from '../../domain/entities/widget'

export interface WidgetDTOProps {
  id: string
  name: string
  description: string
  stock: number
}

export class WidgetDTO {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly stock: number

  constructor(props: WidgetDTOProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.stock = props.stock
  }

  static fromDomain(widget: Widget): WidgetDTO {
    return new WidgetDTO({
      id: widget.id,
      name: widget.name,
      description: widget.description,
      stock: widget.stock,
    })
  }
}
