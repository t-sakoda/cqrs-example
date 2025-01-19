import type {WidgetDTO} from '../dto/widgetDTO'
import type {ICommand} from './iCommand'

export interface GetWidgetCommandInput {
  id: string
}

export interface GetWidgetCommandOutput {
  output: WidgetDTO
}

export class GetWidgetCommand
  implements ICommand<GetWidgetCommandInput, GetWidgetCommandOutput>
{
  constructor(public readonly input: GetWidgetCommandInput) {}
  getOutputType(): GetWidgetCommandOutput {
    throw new Error(
      'This method is for type inference only and should not be called.',
    )
  }
}
