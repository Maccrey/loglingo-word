export type LeaderboardScoreInput = {
  correctStreak: number;
};

export type LeaderboardScoreResult = {
  countedStreaks: number;
  score: number;
};

const LEADERBOARD_STREAK_UNIT = 3;

export function calculateLeaderboardScore(
  input: LeaderboardScoreInput
): LeaderboardScoreResult {
  const safeStreak = Math.max(0, Math.floor(input.correctStreak));
  const countedStreaks = Math.floor(safeStreak / LEADERBOARD_STREAK_UNIT);

  return {
    countedStreaks,
    score: countedStreaks
  };
}
