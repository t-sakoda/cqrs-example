import type {ISnapshotRepository} from '../../../src/domain/repositories/iSnapshotRepository'

export const mockSnapshotRepository = (): ISnapshotRepository => ({
  getLatestSnapshot: vi.fn(),
  saveSnapshot: vi.fn(),
})
