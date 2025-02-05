import type {Widget} from '../domain/entities/widget'
import type {IWidgetRepository} from '../domain/repositories/iWidgetRepository'

export class WidgetDdbRepository implements IWidgetRepository {
  findById(id: string): Promise<Widget> {
    throw new Error('Method not implemented.')
  }
  findAll(): Promise<Widget[]> {
    throw new Error('Method not implemented.')
  }
  save(widget: Widget): Promise<void> {
    throw new Error('Method not implemented.')
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
