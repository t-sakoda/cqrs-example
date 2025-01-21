import type {Snapshot} from '../entities/snapshot'

export interface ISnapshotRepository {
  getLatestSnapshot(id: string): Promise<Snapshot>
  saveSnapshot(snapshot: Snapshot): Promise<void>
}
