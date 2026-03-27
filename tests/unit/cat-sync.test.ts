import { describe, expect, it } from 'vitest';

import {
  InMemoryCatStateRepository,
  syncCatState
} from '../../services/core/src/cat-sync';

describe('cat sync', () => {
  it('persists cat state into the repository', async () => {
    const repository = new InMemoryCatStateRepository();

    const result = await syncCatState(
      {
        userId: 'demo-user',
        syncedAt: '2026-03-27T00:00:00.000Z',
        cat: {
          id: 'cat-1',
          userId: 'demo-user',
          name: '로그링고',
          stage: 'kitten',
          status: 'healthy',
          createdAt: 1,
          updatedAt: 1,
          lastFedAt: 1,
          lastWashedAt: 1,
          lastPlayedAt: 1,
          activeDays: 0
        }
      },
      repository
    );

    expect(result.userId).toBe('demo-user');
    expect((await repository.findByUserId('demo-user'))?.cat.name).toBe('로그링고');
  });
});
