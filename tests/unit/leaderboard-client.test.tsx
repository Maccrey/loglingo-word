// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LeaderboardClient from '../../apps/web/src/app/leaderboard/LeaderboardClient';
import { buildLeaderboardPageState } from '../../apps/web/src/app/leaderboard/page';

afterEach(() => {
  cleanup();
});

describe('leaderboard ui', () => {
  it('renders the leaderboard list', () => {
    render(<LeaderboardClient entries={buildLeaderboardPageState().entries} />);

    expect(screen.getAllByText('주간 리더보드').length).toBeGreaterThan(0);
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText('나')).toBeTruthy();
  });

  it('highlights the current user entry', () => {
    const { container } = render(
      <LeaderboardClient entries={buildLeaderboardPageState().entries} />
    );
    const currentUserCard = container.querySelector(
      '[data-current-user="true"]'
    );

    expect(currentUserCard?.textContent).toContain('나');
  });

  it('shows a fallback when the leaderboard is empty', () => {
    render(<LeaderboardClient entries={[]} />);

    expect(screen.getByText('아직 리더보드 데이터가 없습니다.')).toBeTruthy();
  });

  it('applies the incoming recommendation score to the leaderboard state', () => {
    const state = buildLeaderboardPageState({
      source: 'recommendation',
      score: '2',
      userId: 'demo-user'
    });

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        pendingScoreDelta={state.pendingScoreDelta}
      />
    );

    expect(
      screen.getByText('이번 추천 학습으로 리더보드 점수 2점이 반영됐습니다.')
    ).toBeTruthy();
    expect(screen.getByText('8 pt')).toBeTruthy();
  });
});
