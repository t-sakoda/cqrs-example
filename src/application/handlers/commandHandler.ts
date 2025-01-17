import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {
  ICommand,
  ICommandInput,
  ICommandOutput,
} from '../commands/iCommand'

export abstract class CommandHandler<C extends ICommand<unknown, unknown>> {
  constructor(protected widgetRepository: IWidgetRepository) {}

  abstract execute(command: C): C extends ICommand<unknown, infer O> ? O : never
}
