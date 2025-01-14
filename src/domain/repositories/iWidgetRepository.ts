import type {Widget} from '../entities/widget'

export interface IWidgetRepository {
  findById(id: string): Promise<Widget>
  findAll(): Promise<Widget[]>
  save(widget: Widget): Promise<void>
  delete(id: string): Promise<void>
}
