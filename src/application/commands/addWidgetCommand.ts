import {Widget} from '../../domain/entities/widget'
import type {WidgetDTO} from '../dto/widgetDTO'
import type {ICommand} from './iCommand'

export interface AddWidgetCommandInput {
  name: string
  description: string
  stock: number
}

export interface AddWidgetCommandOutput {
  output: WidgetDTO
}

export class AddWidgetCommand
  implements ICommand<AddWidgetCommandInput, AddWidgetCommandOutput>
{
  constructor(readonly input: AddWidgetCommandInput) {}
}
