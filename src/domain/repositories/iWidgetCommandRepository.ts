import type {Widget} from '../entities/widget'

export interface IWidgetCommandRepository {
  saveWidget(widget: Widget): Promise<void>
  deleteWidget(id: string): Promise<void>
}
