import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import {WidgetDTO} from '../dto/widgetDTO'

export class ListWidgetHandler {
  constructor(private widgetRepository: IWidgetRepository) {}

  async execute(): Promise<WidgetDTO[]> {
    const widgets = await this.widgetRepository.findAll()
    return widgets.map(WidgetDTO.fromDomain)
  }
}
