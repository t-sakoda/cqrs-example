import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {
  ICommand,
  ICommandInput,
  ICommandOutput,
} from '../commands/iCommand'

export abstract class CommandHandler<
  C extends ICommand<I, O>,
  I extends ICommandInput = C extends ICommand<infer I, infer O> ? I : never,
  O extends ICommandOutput = C extends ICommand<infer I, infer O> ? O : never,
> {
  constructor(protected widgetRepository: IWidgetRepository) {}

  abstract execute(command: C): O | Promise<O>
}
