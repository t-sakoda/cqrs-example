import type {
  ICommand,
  ICommandInput,
  ICommandOutput,
} from '../commands/iCommand'
import type {CommandHandler} from '../handlers/commandHandler'

export class CommandBus {
  // biome-ignore lint/suspicious/noExplicitAny: Any is used to define a contract for a command.
  private handlers = new Map<string, CommandHandler<any>>()

  register<
    C extends ICommand<I, O>,
    I extends ICommandInput,
    O extends ICommandOutput,
  >(commandType: new (input: I) => C, handler: CommandHandler<C, I, O>): void {
    this.handlers.set(commandType.name, handler)
  }

  execute<
    C extends ICommand<I, O>,
    I extends ICommandInput = C extends ICommand<infer I, infer O> ? I : never,
    O extends ICommandOutput = C extends ICommand<I, infer O> ? O : never,
  >(command: C): O | Promise<O> {
    const handler = this.handlers.get(
      command.constructor.name,
    ) as CommandHandler<C, I, O>
    if (!handler) {
      throw new Error(
        `Handler not found for command: ${command.constructor.name}`,
      )
    }
    return handler.execute(command)
  }
}
