// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InMemoryLeaderboardRepository } from '../../services/leaderboard/src';

import LeaderboardClient from '../../apps/web/src/app/leaderboard/LeaderboardClient';
import { buildLeaderboardPageState } from '../../apps/web/src/app/leaderboard/page';

afterEach(() => {
  cleanup();
});

describe('leaderboard ui', () => {
  it('renders the leaderboard list', async () => {
    const state = await buildLeaderboardPageState();

    render(<LeaderboardClient entries={state.entries} />);

    expect(screen.getAllByText('주간 리더보드').length).toBeGreaterThan(0);
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText('나')).toBeTruthy();
  });

  it('highlights the current user entry', async () => {
    const state = await buildLeaderboardPageState();
    const { container } = render(<LeaderboardClient entries={state.entries} />);
    const currentUserCard = container.querySelector(
      '[data-current-user="true"]'
    );

    expect(currentUserCard?.textContent).toContain('나');
  });

  it('shows a fallback when the leaderboard is empty', () => {
    render(<LeaderboardClient entries={[]} />);

    expect(screen.getByText('아직 리더보드 데이터가 없습니다.')).toBeTruthy();
  });

  it('applies the incoming recommendation score to the leaderboard state', async () => {
    const state = await buildLeaderboardPageState({
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

  it('uses persisted leaderboard entries as the initial state', async () => {
    const repository = new InMemoryLeaderboardRepository();

    await repository.saveByWeekId('2026-W13', [
      {
        weekId: '2026-W13',
        userId: 'demo-user',
        score: 11,
        rank: 1
      }
    ]);

    const state = await buildLeaderboardPageState(undefined, repository);

    expect(state.entries).toEqual([
      {
        weekId: '2026-W13',
        userId: 'demo-user',
        score: 11,
        rank: 1
      }
    ]);
  });
});
