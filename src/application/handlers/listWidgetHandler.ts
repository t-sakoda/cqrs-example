import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {ListWidgetCommand} from '../commands/listWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class ListWidgetHandler extends CommandHandler<ListWidgetCommand> {
  constructor(private widgetRepository: IWidgetRepository) {
    super(widgetRepository)
  }

  async execute(): Promise<WidgetDTO[]> {
    const widgets = await this.widgetRepository.findAll()
    return widgets.map(WidgetDTO.fromDomain)
  }
}
