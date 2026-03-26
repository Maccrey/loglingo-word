import React from 'react';

import LeaderboardClient from './LeaderboardClient';
import { buildLeaderboardPageState } from './state';

type LeaderboardPageProps = {
  searchParams?: Promise<{
    source?: string;
    score?: string;
    userId?: string;
  }>;
};

export default async function LeaderboardPage(props: LeaderboardPageProps) {
  const searchParams = await props.searchParams;
  const state = await buildLeaderboardPageState(searchParams);

  return (
    <LeaderboardClient
      entries={state.entries}
      currentUserId={state.currentUserId}
      focusedUserId={state.focusedUserId}
      {...(state.pendingScoreDelta !== undefined
        ? { pendingScoreDelta: state.pendingScoreDelta }
        : {})}
    />
  );
}
