import { describe, expect, it } from 'vitest';

import { calculateLeaderboardScore } from '../../services/leaderboard/src/scoring';

describe('leaderboard scoring', () => {
  it('does not count streaks below three correct answers', () => {
    expect(calculateLeaderboardScore({ correctStreak: 2 })).toEqual({
      countedStreaks: 0,
      score: 0
    });
  });

  it('counts one score unit for every three correct answers', () => {
    expect(calculateLeaderboardScore({ correctStreak: 3 })).toEqual({
      countedStreaks: 1,
      score: 1
    });

    expect(calculateLeaderboardScore({ correctStreak: 7 })).toEqual({
      countedStreaks: 2,
      score: 2
    });
  });
});
