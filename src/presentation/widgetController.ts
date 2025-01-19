import type {CommandBus} from '../application/bus/commandBus'
import {AddWidgetCommand} from '../application/commands/addWidgetCommand'
import {GetWidgetCommand} from '../application/commands/getWidgetCommand'
import {ListWidgetCommand} from '../application/commands/listWidgetCommand'
import {RemoveWidgetCommand} from '../application/commands/removeWidgetCommand'
import {
  UpdateWidgetCommand,
  type UpdateWidgetCommandInput,
} from '../application/commands/updateWidgetCommand'
import type {WidgetDTO} from '../application/dto/widgetDTO'

export class WidgetController {
  constructor(private readonly commandBus: CommandBus) {}

  async addWidget(
    name: string,
    description: string,
    stock: number,
  ): Promise<WidgetDTO> {
    const command = new AddWidgetCommand({name, description, stock})
    const result = await this.commandBus.execute(command)
    return result.output
  }

  async getWidget(id: string): Promise<WidgetDTO> {
    const command = new GetWidgetCommand({id})
    const result = await this.commandBus.execute(command)
    return result.output
  }

  async listWidgets(): Promise<WidgetDTO[]> {
    const command = new ListWidgetCommand({})
    const result = await this.commandBus.execute(command)
    return result.output
  }

  async removeWidget(id: string): Promise<void> {
    const command = new RemoveWidgetCommand({id})
    const result = await this.commandBus.execute(command)
    console.debug('Remove:', result)
  }

  async updateWidget(widgetDTO: WidgetDTO): Promise<WidgetDTO> {
    const input: UpdateWidgetCommandInput = {
      id: widgetDTO.id,
      name: widgetDTO.name,
      description: widgetDTO.description,
      stock: widgetDTO.stock,
    }
    const command = new UpdateWidgetCommand(input)
    const result = await this.commandBus.execute(command)
    return result.output
  }
}
