import React from 'react';

import {
  getLeaderboardWeek,
  upsertLeaderboardScore,
  type LeaderboardEntryRecord
} from '@wordflow/leaderboard';

import LeaderboardClient from './LeaderboardClient';
import { getLeaderboardRepository } from '../../lib/leaderboard-repository';

type LeaderboardPageProps = {
  searchParams?: Promise<{
    source?: string;
    score?: string;
    userId?: string;
  }>;
};

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
  repository = getLeaderboardRepository()
) {
  const weekId = getLeaderboardWeek('2026-03-26T00:00:00.000Z').weekId;
  const scoreDelta = parseScore(input?.score);
  const currentUserId = input?.userId?.trim() || 'demo-user';
  let entries = await repository.listByWeekId(weekId);

  if (entries.length === 0) {
    entries = await repository.saveByWeekId(
      weekId,
      buildDefaultEntries(weekId)
    );
  }

  if (input?.source === 'recommendation' && scoreDelta > 0) {
    entries = await repository.saveByWeekId(
      weekId,
      upsertLeaderboardScore({
        entries,
        weekId,
        userId: currentUserId,
        scoreDelta
      }).entries
    );
  }

  return {
    entries,
    currentUserId,
    pendingScoreDelta:
      input?.source === 'recommendation' ? scoreDelta : undefined
  };
}

export default async function LeaderboardPage(props: LeaderboardPageProps) {
  const searchParams = await props.searchParams;
  const state = await buildLeaderboardPageState(searchParams);

  return (
    <LeaderboardClient
      entries={state.entries}
      currentUserId={state.currentUserId}
      {...(state.pendingScoreDelta !== undefined
        ? { pendingScoreDelta: state.pendingScoreDelta }
        : {})}
    />
  );
}
