import {Aggregate, type AggregateProps, AggregateType} from './aggregate'

export interface WidgetAggregateProps extends Omit<AggregateProps, 'type'> {}

export class WidgetAggregate extends Aggregate {
  constructor(props: WidgetAggregateProps) {
    super({...props, type: AggregateType.Widget})
  }
}
