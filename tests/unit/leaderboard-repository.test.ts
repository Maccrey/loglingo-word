import { describe, expect, it } from 'vitest';

import { getLeaderboardRepository } from '../../apps/web/src/lib/leaderboard-repository';

describe('leaderboard repository', () => {
  it('reuses the in-memory repository instance when firebase is not configured', async () => {
    const repository = getLeaderboardRepository();

    await repository.saveByWeekId('2026-W13', [
      {
        weekId: '2026-W13',
        userId: 'demo-user',
        score: 9,
        rank: 1
      }
    ]);

    const repeatedLookup =
      await getLeaderboardRepository().listByWeekId('2026-W13');

    expect(repeatedLookup).toEqual([
      {
        weekId: '2026-W13',
        userId: 'demo-user',
        score: 9,
        rank: 1
      }
    ]);
  });
});
