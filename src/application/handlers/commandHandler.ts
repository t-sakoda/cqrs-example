import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {ICommand} from '../commands/iCommand'

export abstract class CommandHandler<T extends ICommand> {
  constructor(protected repository: IWidgetRepository) {}
  abstract execute(command: T): Promise<unknown>
}
