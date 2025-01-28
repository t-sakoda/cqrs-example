import type {WidgetDTO} from '../../application/dto/widgetDTO'

export const WidgetQueryRepositoryErrorCode = {
  WidgetNotFound: 'WidgetNotFound',
  InternalError: 'InternalError',
} as const
export type WidgetQueryRepositoryErrorCode =
  (typeof WidgetQueryRepositoryErrorCode)[keyof typeof WidgetQueryRepositoryErrorCode]

export interface IWidgetQueryRepository {
  getWidgetById(id: string): Promise<WidgetDTO>
  listWidgets(): Promise<WidgetDTO[]>
}
