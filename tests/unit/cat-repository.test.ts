import { describe, expect, it } from 'vitest';

import { getCatStateRepository } from '../../apps/web/src/lib/cat-repository';

describe('cat repository', () => {
  it('reuses the in-memory repository instance when firebase is not configured', async () => {
    const repository = getCatStateRepository();

    await repository.save({
      userId: 'demo-user',
      syncedAt: '2026-03-27T00:00:00.000Z',
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '나비',
        stage: 'kitten',
        status: 'healthy',
        createdAt: 1,
        updatedAt: 1,
        lastFedAt: 1,
        lastWashedAt: 1,
        lastPlayedAt: 1,
        activeDays: 0
      }
    });

    const repeatedLookup = await getCatStateRepository().findByUserId('demo-user');

    expect(repeatedLookup?.cat.name).toBe('나비');
  });
});
