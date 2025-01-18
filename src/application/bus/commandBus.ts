import type {
  ICommand,
  ICommandInput,
  ICommandOutput,
} from '../commands/iCommand'
import type {CommandHandler} from '../handlers/commandHandler'

export class CommandBus {
  private handlers = new Map<
    string,
    CommandHandler<
      ICommandInput,
      ICommandOutput,
      ICommand<ICommandInput, ICommandOutput>
    >
  >()

  register<
    I extends ICommandInput,
    O extends ICommandOutput,
    C extends ICommand<I, O>,
  >(
    commandType: new (input: unknown) => C,
    handler: CommandHandler<I, O, C>,
  ): void {
    this.handlers.set(commandType.name, handler)
  }

  execute<
    I extends ICommandInput,
    O extends ICommandOutput,
    C extends ICommand<I, O>,
  >(command: C): O | Promise<O> {
    const handler = this.handlers.get(
      command.constructor.name,
    ) as CommandHandler<I, O, C>
    if (!handler) {
      throw new Error(
        `Handler not found for command: ${command.constructor.name}`,
      )
    }
    return handler.execute(command)
  }
}
