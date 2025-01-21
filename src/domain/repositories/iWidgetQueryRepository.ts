import type {WidgetDTO} from '../../application/dto/widgetDTO'

export interface IWidgetQueryRepository {
  getWidgetById(id: string): Promise<WidgetDTO>
  getAllWidgets(): Promise<WidgetDTO[]>
}
