import type {WidgetDTO} from '../dto/widgetDTO'
import type {ICommand} from './iCommand'

// biome-ignore lint/suspicious/noEmptyInterface: Empty interface is used to define a contract for a command.
export interface ListWidgetCommandInput {}

export interface ListWidgetCommandOutput {
  output: WidgetDTO[]
}

export class ListWidgetCommand
  implements ICommand<ListWidgetCommandInput, ListWidgetCommandOutput>
{
  constructor(public readonly input: ListWidgetCommandInput) {}

  getOutputType(): ListWidgetCommandOutput {
    throw new Error(
      'This method is for type inference only and should not be called.',
    )
  }
}
