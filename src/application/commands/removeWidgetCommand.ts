import type {ICommand} from './iCommand'

export class RemoveWidgetCommand implements ICommand {
  constructor(public id: string) {}
}
