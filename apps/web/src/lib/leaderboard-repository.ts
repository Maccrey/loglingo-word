import {
  FirestoreLeaderboardRepository,
  InMemoryLeaderboardRepository,
  type LeaderboardRepository
} from '@wordflow/leaderboard';

import {
  createFirestoreLeaderboardStore,
  hasFirebaseAdminConfig
} from './firebase-admin';

const inMemoryLeaderboardRepository = new InMemoryLeaderboardRepository();

export function getLeaderboardRepository(): LeaderboardRepository {
  return hasFirebaseAdminConfig()
    ? new FirestoreLeaderboardRepository(createFirestoreLeaderboardStore())
    : inMemoryLeaderboardRepository;
}
