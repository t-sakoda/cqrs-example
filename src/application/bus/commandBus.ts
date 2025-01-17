import type {
  ICommand,
  ICommandInput,
  ICommandOutput,
} from '../commands/iCommand'
import type {CommandHandler} from '../handlers/commandHandler'

export class CommandBus {
  private handlers = new Map<
    string,
    CommandHandler<ICommand<ICommandInput, ICommandOutput>>
  >()

  register<C extends ICommand<ICommandInput, ICommandOutput>>(
    commandType: new (input: unknown) => C,
    handler: CommandHandler<C>,
  ): void {
    this.handlers.set(commandType.name, handler)
  }

  execute<C extends ICommand<unknown, ICommandOutput>>(
    command: C,
  ): C extends ICommand<unknown, infer O> ? O : never {
    const handler = this.handlers.get(
      command.constructor.name,
    ) as CommandHandler<C>
    if (!handler) {
      throw new Error(
        `Handler not found for command: ${command.constructor.name}`,
      )
    }
    return handler.execute(command)
  }
}
