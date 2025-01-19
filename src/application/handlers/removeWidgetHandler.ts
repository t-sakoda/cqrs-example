import type {
  RemoveWidgetCommand,
  RemoveWidgetCommandOutput,
} from '../commands/removeWidgetCommand'
import {CommandHandler} from './commandHandler'

export class RemoveWidgetHandler extends CommandHandler<RemoveWidgetCommand> {
  async execute(
    command: RemoveWidgetCommand,
  ): Promise<RemoveWidgetCommandOutput> {
    const widget = await this.widgetRepository.findById(command.input.id)

    if (!widget) {
      throw new Error('Widget not found')
    }

    await this.widgetRepository.delete(widget.id)

    return {success: true}
  }
}
