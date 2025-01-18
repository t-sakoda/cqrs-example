// biome-ignore lint/suspicious/noEmptyInterface: Empty interface is used to define a contract for a command.
export interface ICommandInput {}

export interface ICommandOutput {
  output: unknown
}

export interface ICommand<I extends ICommandInput, O extends ICommandOutput> {
  input: I
}
