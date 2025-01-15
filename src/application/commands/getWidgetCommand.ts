import type {ICommand} from './iCommand'

export class GetWidgetCommand implements ICommand {
  constructor(public id: string) {}
}
