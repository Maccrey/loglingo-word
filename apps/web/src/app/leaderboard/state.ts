import {
  getLeaderboardWeek,
  upsertLeaderboardScore,
  type LeaderboardEntryRecord,
  type LeaderboardRepository
} from '@wordflow/leaderboard';

import { getLeaderboardRepository } from '../../lib/leaderboard-repository';

function buildDefaultEntries(weekId: string): LeaderboardEntryRecord[] {
  let entries: LeaderboardEntryRecord[] = [];

  entries = upsertLeaderboardScore({
    entries,
    weekId,
    userId: 'user-2',
    scoreDelta: 4
  }).entries;

  entries = upsertLeaderboardScore({
    entries,
    weekId,
    userId: 'demo-user',
    scoreDelta: 6
  }).entries;

  entries = upsertLeaderboardScore({
    entries,
    weekId,
    userId: 'user-3',
    scoreDelta: 2
  }).entries;

  return entries;
}

function parseScore(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

export async function buildLeaderboardPageState(
  input?: {
    source?: string;
    score?: string;
    userId?: string;
  },
  repository: LeaderboardRepository = getLeaderboardRepository()
) {
  const weekId = getLeaderboardWeek('2026-03-26T00:00:00.000Z').weekId;
  const scoreDelta = parseScore(input?.score);
  const actualCurrentUserId = 'demo-user';
  const focusedUserId = input?.userId?.trim() || actualCurrentUserId;
  let entries = await repository.listByWeekId(weekId);

  if (entries.length === 0) {
    entries = await repository.saveByWeekId(
      weekId,
      buildDefaultEntries(weekId)
    );
  }

  return {
    entries,
    currentUserId: actualCurrentUserId,
    focusedUserId,
    pendingScoreDelta:
      input?.source === 'recommendation' ? scoreDelta : undefined
  };
}
