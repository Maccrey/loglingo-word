import React from 'react';

import LeaderboardClient from './LeaderboardClient';
import { buildLeaderboardPageState } from './state';
import { resolveLocale } from '../i18n';

type LeaderboardPageProps = {
  searchParams?: Promise<{
    locale?: string;
    source?: string;
    score?: string;
    userId?: string;
    view?: string;
  }>;
};

export default async function LeaderboardPage(props: LeaderboardPageProps) {
  const searchParams = await props.searchParams;
  const state = await buildLeaderboardPageState(searchParams);

  return (
    <LeaderboardClient
      locale={resolveLocale(searchParams?.locale)}
      entries={state.entries}
      currentUserId={state.currentUserId}
      focusedUserId={state.focusedUserId}
      initialViewMode={state.initialViewMode}
      {...(state.pendingScoreDelta !== undefined
        ? { pendingScoreDelta: state.pendingScoreDelta }
        : {})}
    />
  );
}
