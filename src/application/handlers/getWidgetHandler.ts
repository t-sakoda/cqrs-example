import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {GetWidgetCommand} from '../commands/getWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class GetWidgetHandler extends CommandHandler<GetWidgetCommand> {
  constructor(private widgetRepository: IWidgetRepository) {
    super(widgetRepository)
  }

  async execute(command: GetWidgetCommand): Promise<WidgetDTO> {
    const widget = await this.widgetRepository.findById(command.id)

    if (!widget) {
      throw new Error('Widget not found')
    }

    return WidgetDTO.fromDomain(widget)
  }
}
