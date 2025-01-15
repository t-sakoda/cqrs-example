import type {ICommand} from './iCommand'

export class UpdateWidgetCommand implements ICommand {
  constructor(
    public id: string,
    public name?: string,
    public description?: string,
    public stock?: number,
  ) {}
}
