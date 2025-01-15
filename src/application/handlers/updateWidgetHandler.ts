import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {UpdateWidgetCommand} from '../commands/updateWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class UpdateWidgetHandler extends CommandHandler<UpdateWidgetCommand> {
  constructor(private widgetRepository: IWidgetRepository) {
    super(widgetRepository)
  }

  async execute(command: UpdateWidgetCommand): Promise<WidgetDTO> {
    const widget = await this.widgetRepository.findById(command.id)

    if (!widget) {
      throw new Error('Widget not found')
    }

    if (command.name) {
      widget.name = command.name
    }

    if (command.description) {
      widget.description = command.description
    }

    if (command.stock) {
      widget.stock = command.stock
    }

    await this.widgetRepository.save(widget)

    return WidgetDTO.fromDomain(widget)
  }
}
