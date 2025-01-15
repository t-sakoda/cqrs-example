import {Widget} from '../../domain/entities/widget'
import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {AddWidgetCommand} from '../commands/addWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'
import {CommandHandler} from './commandHandler'

export class AddWidgetHandler extends CommandHandler<AddWidgetCommand> {
  constructor(private widgetRepository: IWidgetRepository) {
    super(widgetRepository)
  }

  async execute(command: AddWidgetCommand): Promise<WidgetDTO> {
    const widget = Widget.create({
      name: command.name,
      description: command.description,
      stock: command.stock,
    })

    await this.widgetRepository.save(widget)

    return WidgetDTO.fromDomain(widget)
  }
}
