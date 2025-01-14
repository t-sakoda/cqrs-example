import type {Widget} from '../../domain/entities/widget'

export class WidgetDTO {
  name: string
  description: string
  stock: number

  constructor(name: string, description: string, stock: number) {
    this.name = name
    this.description = description
    this.stock = stock
  }

  static fromDomain(widget: Widget): WidgetDTO {
    return new WidgetDTO(widget.name, widget.description, widget.stock)
  }
}
