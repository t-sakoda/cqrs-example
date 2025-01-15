import type {ICommand} from './iCommand'

export class AddWidgetCommand implements ICommand {
  constructor(
    public name: string,
    public description: string,
    public stock: number,
  ) {}
}
