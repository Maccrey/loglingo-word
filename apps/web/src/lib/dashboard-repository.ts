import {
  FirestoreDashboardStatsRepository,
  InMemoryDashboardStatsRepository,
  type DashboardStatsRepository
} from '@wordflow/core/dashboard';

import {
  createFirestoreDashboardStatsStore,
  hasFirebaseAdminConfig
} from './firebase-admin';

const inMemoryDashboardRepository = new InMemoryDashboardStatsRepository();

export function getDashboardStatsRepository(): DashboardStatsRepository {
  return hasFirebaseAdminConfig()
    ? new FirestoreDashboardStatsRepository(
        createFirestoreDashboardStatsStore()
      )
    : inMemoryDashboardRepository;
}
