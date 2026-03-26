import { describe, expect, it } from 'vitest';

import { getDashboardStatsRepository } from '../../apps/web/src/lib/dashboard-repository';

describe('dashboard repository', () => {
  it('reuses the in-memory repository instance when firebase is not configured', async () => {
    const repository = getDashboardStatsRepository();

    await repository.save({
      userId: 'demo-user',
      totalPoints: 30,
      leaderboardScore: 2,
      updatedAt: '2026-03-26T00:00:00.000Z'
    });

    const repeatedLookup =
      await getDashboardStatsRepository().findByUserId('demo-user');

    expect(repeatedLookup?.totalPoints).toBe(30);
    expect(repeatedLookup?.leaderboardScore).toBe(2);
  });
});
