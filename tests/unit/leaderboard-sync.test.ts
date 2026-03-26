import { describe, expect, it } from 'vitest';

import {
  InMemoryLeaderboardRepository,
  syncLeaderboardScore
} from '../../services/leaderboard/src';

describe('leaderboard sync', () => {
  it('persists the score delta into the weekly leaderboard repository', async () => {
    const repository = new InMemoryLeaderboardRepository();

    const result = await syncLeaderboardScore(
      {
        weekId: '2026-W13',
        userId: 'demo-user',
        scoreDelta: 2
      },
      repository
    );

    expect(result.updatedEntry).toEqual({
      weekId: '2026-W13',
      userId: 'demo-user',
      score: 2,
      rank: 1
    });
    expect(await repository.listByWeekId('2026-W13')).toEqual(result.entries);
  });

  it('rejects an empty user id', async () => {
    const repository = new InMemoryLeaderboardRepository();

    await expect(
      syncLeaderboardScore(
        {
          weekId: '2026-W13',
          userId: '',
          scoreDelta: 1
        },
        repository
      )
    ).rejects.toThrow('Leaderboard userId is required.');
  });
});
