import { describe, expect, it } from 'vitest';

import { getLeaderboardWeek } from '../../services/leaderboard/src/week';

describe('leaderboard week key', () => {
  it('returns the same weekId for dates in the same ISO week', () => {
    const monday = getLeaderboardWeek('2026-03-23T09:00:00.000Z');
    const sunday = getLeaderboardWeek('2026-03-29T21:00:00.000Z');

    expect(monday.weekId).toBe('2026-W13');
    expect(sunday.weekId).toBe('2026-W13');
    expect(monday.weekStart).toBe('2026-03-23');
    expect(monday.weekEnd).toBe('2026-03-29');
  });

  it('changes the weekId at the next week boundary', () => {
    const sunday = getLeaderboardWeek('2026-03-29T23:59:59.000Z');
    const monday = getLeaderboardWeek('2026-03-30T00:00:00.000Z');

    expect(sunday.weekId).toBe('2026-W13');
    expect(monday.weekId).toBe('2026-W14');
  });
});
