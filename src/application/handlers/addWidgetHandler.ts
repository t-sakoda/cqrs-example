import {Widget} from '../../domain/entities/widget'
import type {
  AddWidgetCommand,
  AddWidgetCommandOutput,
} from '../commands/addWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class AddWidgetHandler extends CommandHandler<AddWidgetCommand> {
  async execute(command: AddWidgetCommand): Promise<AddWidgetCommandOutput> {
    const widget = Widget.create(command.input)

    await this.widgetRepository.save(widget)

    const output = WidgetDTO.fromDomain(widget)
    return {output}
  }
}
