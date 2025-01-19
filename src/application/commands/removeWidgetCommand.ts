import type {ICommand} from './iCommand'

export interface RemoveWidgetCommandInput {
  id: string
}

export interface RemoveWidgetCommandOutput {
  success: boolean
}

export class RemoveWidgetCommand
  implements ICommand<RemoveWidgetCommandInput, RemoveWidgetCommandOutput>
{
  constructor(readonly input: RemoveWidgetCommandInput) {}
  getOutputType(): RemoveWidgetCommandOutput {
    throw new Error(
      'This method is for type inference only and should not be called.',
    )
  }
}
