// biome-ignore lint/suspicious/noEmptyInterface: Empty interface is used to define a contract for a command.
export interface ICommandInput {}

// biome-ignore lint/suspicious/noEmptyInterface: Empty interface is used to define a contract for a command.
export interface ICommandOutput {}

export interface ICommand<I extends ICommandInput, O extends ICommandOutput> {
  input: I
  getOutputType(): O
}
