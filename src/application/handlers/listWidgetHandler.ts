import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {
  ListWidgetCommand,
  ListWidgetCommandOutput,
} from '../commands/listWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class ListWidgetHandler extends CommandHandler<ListWidgetCommand> {
  async execute(): Promise<ListWidgetCommandOutput> {
    const widgets = await this.widgetRepository.findAll()
    const output = widgets.map(WidgetDTO.fromDomain)
    return {output}
  }
}
