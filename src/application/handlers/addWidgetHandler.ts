import {Widget} from '../../domain/entities/widget'
import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {AddWidgetCommand} from '../commands/addWidgetCommand'
import {WidgetDTO} from '../dto/widgetDTO'

export class AddWidgetHandler {
  constructor(private widgetRepository: IWidgetRepository) {}

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
