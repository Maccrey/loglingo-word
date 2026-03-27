import {
  FirestorePointLedgerSyncRepository,
  InMemoryPointLedgerSyncRepository,
  type PointLedgerSyncRepository
} from '@wordflow/core/point-sync';

import {
  createFirestorePointLedgerSyncStore,
  hasFirebaseAdminConfig
} from './firebase-admin';

const inMemoryPointLedgerRepository = new InMemoryPointLedgerSyncRepository();

export function getPointLedgerSyncRepository(): PointLedgerSyncRepository {
  return hasFirebaseAdminConfig()
    ? new FirestorePointLedgerSyncRepository(
        createFirestorePointLedgerSyncStore()
      )
    : inMemoryPointLedgerRepository;
}
