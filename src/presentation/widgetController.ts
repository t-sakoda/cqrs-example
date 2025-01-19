import type {CommandBus} from '../application/bus/commandBus'
import {AddWidgetCommand} from '../application/commands/addWidgetCommand'
import {GetWidgetCommand} from '../application/commands/getWidgetCommand'
import {
  ListWidgetCommand,
  type ListWidgetCommandInput,
} from '../application/commands/listWidgetCommand'
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
}
