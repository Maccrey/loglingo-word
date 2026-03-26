import { describe, expect, it } from 'vitest';

import { upsertLeaderboardScore } from '../../services/leaderboard/src/aggregation';

describe('leaderboard aggregation', () => {
  it('creates a new leaderboard entry for a new user', () => {
    const result = upsertLeaderboardScore({
      entries: [],
      weekId: '2026-W13',
      userId: 'user-1',
      scoreDelta: 2
    });

    expect(result.updatedEntry).toEqual({
      weekId: '2026-W13',
      userId: 'user-1',
      score: 2,
      rank: 1
    });
    expect(result.myRank).toBe(1);
  });

  it('accumulates score for an existing user', () => {
    const result = upsertLeaderboardScore({
      entries: [
        {
          weekId: '2026-W13',
          userId: 'user-1',
          score: 2,
          rank: 1
        }
      ],
      weekId: '2026-W13',
      userId: 'user-1',
      scoreDelta: 3
    });

    expect(result.updatedEntry.score).toBe(5);
    expect(result.updatedEntry.rank).toBe(1);
  });

  it('recalculates rank after score updates', () => {
    const result = upsertLeaderboardScore({
      entries: [
        {
          weekId: '2026-W13',
          userId: 'user-1',
          score: 2,
          rank: 2
        },
        {
          weekId: '2026-W13',
          userId: 'user-2',
          score: 4,
          rank: 1
        }
      ],
      weekId: '2026-W13',
      userId: 'user-1',
      scoreDelta: 3
    });

    expect(result.updatedEntry.score).toBe(5);
    expect(result.myRank).toBe(1);
    expect(result.entries[0]?.userId).toBe('user-1');
    expect(result.entries[1]?.rank).toBe(2);
  });
});
