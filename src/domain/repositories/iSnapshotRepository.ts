import type {Snapshot} from '../entities/snapshot'

export const SnapshotRepositoryErrorCode = {
  SnapshotNotFound: 'SnapshotNotFound',
  SnapshotVersionNotNewer: 'SnapshotVersionNotNewer',
} as const
export type SnapshotRepositoryErrorCode =
  (typeof SnapshotRepositoryErrorCode)[keyof typeof SnapshotRepositoryErrorCode]

export interface ISnapshotRepository {
  getLatestSnapshot(aggregateId: string): Promise<Snapshot>
  saveSnapshot(snapshot: Snapshot): Promise<void>
}
