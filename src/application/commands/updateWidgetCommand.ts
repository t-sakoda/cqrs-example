import type {WidgetDTO} from '../dto/widgetDTO'
import type {ICommand} from './iCommand'

export interface UpdateWidgetCommandInput {
  id: string
  name?: string
  description?: string
  stock?: number
}

export interface UpdateWidgetCommandOutput {
  output: WidgetDTO
}

export class UpdateWidgetCommand
  implements ICommand<UpdateWidgetCommandInput, UpdateWidgetCommandOutput>
{
  constructor(readonly input: UpdateWidgetCommandInput) {}

  getOutputType(): UpdateWidgetCommandOutput {
    throw new Error(
      'This method is for type inference only and should not be called.',
    )
  }
}
