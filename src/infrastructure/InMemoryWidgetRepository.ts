import type {Widget} from '../domain/entities/widget'
import type {IWidgetRepository} from '../domain/repositories/iWidgetRepository'

export class InMemoryWidgetRepository implements IWidgetRepository {
  private widgets: Map<string, Widget> = new Map()

  async findById(id: string): Promise<Widget> {
    const widget = this.widgets.get(id)
    if (!widget) {
      throw new Error('Widget not found')
    }
    return widget
  }

  async findAll(): Promise<Widget[]> {
    return Array.from(this.widgets.values())
  }

  async save(widget: Widget): Promise<void> {
    this.widgets.set(widget.id, widget)
  }

  async delete(id: string): Promise<void> {
    if (!this.widgets.delete(id)) {
      throw new Error('Widget not found')
    }
  }
}
