import {randomUUID} from 'node:crypto'

interface WidgetProps {
  id: string
  name: string
  description: string
  stock: number
}

export interface CreateWidgetProps {
  name: string
  description: string
  stock: number
}

export interface WidgetState {
  name: string
  description: string
  stock: number
}

export class Widget {
  readonly id: string
  name: string
  description: string
  stock: number

  private constructor(props: WidgetProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.stock = props.stock
  }

  static create(props: CreateWidgetProps): Widget {
    return new Widget({
      ...props,
      id: randomUUID(),
    })
  }
}
