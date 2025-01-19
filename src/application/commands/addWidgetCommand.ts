import type {WidgetDTO} from '../dto/widgetDTO'
import type {ICommand, ICommandInput, ICommandOutput} from './iCommand'

export interface AddWidgetCommandInput extends ICommandInput {
  name: string
  description: string
  stock: number
}

export interface AddWidgetCommandOutput extends ICommandOutput {
  output: WidgetDTO
}

export class AddWidgetCommand
  implements ICommand<AddWidgetCommandInput, AddWidgetCommandOutput>
{
  constructor(public readonly input: AddWidgetCommandInput) {}

  getOutputType(): AddWidgetCommandOutput {
    throw new Error(
      'This method is for type inference only and should not be called.',
    )
  }
}
