import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {
  UpdateWidgetCommand,
  UpdateWidgetCommandOutput,
} from '../commands/updateWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class UpdateWidgetHandler extends CommandHandler<UpdateWidgetCommand> {
  async execute(
    command: UpdateWidgetCommand,
  ): Promise<UpdateWidgetCommandOutput> {
    const {input} = command
    const widget = await this.widgetRepository.findById(input.id)

    if (!widget) {
      throw new Error('Widget not found')
    }

    if (input.name) {
      widget.name = input.name
    }

    if (input.description) {
      widget.description = input.description
    }

    if (input.stock) {
      widget.stock = input.stock
    }

    await this.widgetRepository.save(widget)

    const output = WidgetDTO.fromDomain(widget)
    return {output}
  }
}
