import type {
  GetWidgetCommand,
  GetWidgetCommandOutput,
} from '../commands/getWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class GetWidgetHandler extends CommandHandler<GetWidgetCommand> {
  async execute(command: GetWidgetCommand): Promise<GetWidgetCommandOutput> {
    const widget = await this.widgetRepository.findById(command.input.id)

    if (!widget) {
      throw new Error('Widget not found')
    }

    const output = WidgetDTO.fromDomain(widget)
    return {output}
  }
}
