import { describe, expect, it } from 'vitest';

import {
  InMemoryDashboardStatsRepository,
  createDefaultDashboardStats,
  syncDashboardStats
} from '../../services/core/src/dashboard';

describe('dashboard stats sync', () => {
  it('creates default stats for a new user and applies deltas', async () => {
    const repository = new InMemoryDashboardStatsRepository();

    const result = await syncDashboardStats(
      {
        userId: 'demo-user',
        pointsDelta: 10,
        leaderboardDelta: 2,
        updatedAt: '2026-03-26T00:00:00.000Z'
      },
      repository
    );

    expect(result.totalPoints).toBe(10);
    expect(result.leaderboardScore).toBe(2);
  });

  it('accumulates on top of existing stats', async () => {
    const repository = new InMemoryDashboardStatsRepository();

    await repository.save(
      createDefaultDashboardStats('demo-user', '2026-03-25T00:00:00.000Z')
    );
    await syncDashboardStats(
      {
        userId: 'demo-user',
        pointsDelta: 10,
        leaderboardDelta: 1,
        updatedAt: '2026-03-26T00:00:00.000Z'
      },
      repository
    );
    const result = await syncDashboardStats(
      {
        userId: 'demo-user',
        pointsDelta: 5,
        leaderboardDelta: 2,
        updatedAt: '2026-03-27T00:00:00.000Z'
      },
      repository
    );

    expect(result.totalPoints).toBe(15);
    expect(result.leaderboardScore).toBe(3);
  });
});
