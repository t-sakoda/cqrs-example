import type {CommandBus} from '../application/bus/commandBus'
import {
  AddWidgetCommand,
  type AddWidgetCommandInput,
  type AddWidgetCommandOutput,
} from '../application/commands/addWidgetCommand'
import type {WidgetDTO} from '../application/dto/widgetDTO'

export class WidgetController {
  constructor(private readonly commandBus: CommandBus) {}

  async addWidget(
    name: string,
    description: string,
    stock: number,
  ): Promise<WidgetDTO> {
    const command = new AddWidgetCommand({name, description, stock})
    const {output} = await this.commandBus.execute<
      AddWidgetCommandInput,
      AddWidgetCommandOutput,
      AddWidgetCommand
    >(command)
    return output
  }
}
