import {
  FirestoreCatStateRepository,
  InMemoryCatStateRepository,
  type CatStateRepository
} from '@wordflow/core/cat-sync';

import {
  createFirestoreCatStateStore,
  hasFirebaseAdminConfig
} from './firebase-admin';

const inMemoryCatRepository = new InMemoryCatStateRepository();

export function getCatStateRepository(): CatStateRepository {
  return hasFirebaseAdminConfig()
    ? new FirestoreCatStateRepository(createFirestoreCatStateStore())
    : inMemoryCatRepository;
}
