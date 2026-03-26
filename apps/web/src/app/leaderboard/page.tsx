import React from 'react';

import {
  getLeaderboardWeek,
  upsertLeaderboardScore,
  type LeaderboardEntryRecord
} from '@wordflow/leaderboard';

import LeaderboardClient from './LeaderboardClient';

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

export function buildLeaderboardPageState(input?: {
  source?: string;
  score?: string;
  userId?: string;
}) {
  const weekId = getLeaderboardWeek('2026-03-26T00:00:00.000Z').weekId;
  const scoreDelta = parseScore(input?.score);
  const currentUserId = input?.userId?.trim() || 'demo-user';
  let entries = buildDefaultEntries(weekId);

  if (input?.source === 'recommendation' && scoreDelta > 0) {
    entries = upsertLeaderboardScore({
      entries,
      weekId,
      userId: currentUserId,
      scoreDelta
    }).entries;
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
  const state = buildLeaderboardPageState(searchParams);

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
