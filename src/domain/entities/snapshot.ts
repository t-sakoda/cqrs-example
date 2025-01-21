export interface SnapshotProps {
  aggregateId: string
  version: number
  createdAt: string
  payload: any
  eventNumber: number
}

export class Snapshot {
  readonly aggregateId: string
  readonly version: number
  readonly createdAt: string
  readonly payload: any
  readonly eventNumber: number

  constructor(props: SnapshotProps) {
    this.aggregateId = props.aggregateId
    this.version = props.version
    this.createdAt = props.createdAt
    this.payload = props.payload
    this.eventNumber = props.eventNumber
  }
}
