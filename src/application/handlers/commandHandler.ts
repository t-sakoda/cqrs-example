import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {
  ICommand,
  ICommandInput,
  ICommandOutput,
} from '../commands/iCommand'

export abstract class CommandHandler<
  I extends ICommandInput,
  O extends ICommandOutput,
  C extends ICommand<I, O>,
> {
  constructor(protected widgetRepository: IWidgetRepository) {}

  abstract execute(command: C): C extends ICommand<unknown, infer O> ? O : never
}
