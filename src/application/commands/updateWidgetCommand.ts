export class UpdateWidgetCommand {
  constructor(
    public id: string,
    public name?: string,
    public description?: string,
    public stock?: number,
  ) {}
}
