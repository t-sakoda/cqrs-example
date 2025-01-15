import type {IWidgetRepository} from '../../domain/repositories/iWidgetRepository'
import type {RemoveWidgetCommand} from '../commands/removeWidgetCommand'

export class RemoveWidgetHandler {
  constructor(private widgetRepository: IWidgetRepository) {}

  async execute(command: RemoveWidgetCommand): Promise<void> {
    const widget = await this.widgetRepository.findById(command.id)

    if (!widget) {
      throw new Error('Widget not found')
    }

    await this.widgetRepository.delete(widget.id)
  }
}
