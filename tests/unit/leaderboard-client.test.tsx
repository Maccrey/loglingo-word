// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryLeaderboardRepository } from '../../services/leaderboard/src';

import LeaderboardClient from '../../apps/web/src/app/leaderboard/LeaderboardClient';
import { buildLeaderboardPageState } from '../../apps/web/src/app/leaderboard/state';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('leaderboard ui', () => {
  it('renders the leaderboard list', async () => {
    const state = await buildLeaderboardPageState();

    render(<LeaderboardClient entries={state.entries} />);

    expect(screen.getAllByText('주간 리더보드').length).toBeGreaterThan(0);
    expect(screen.getAllByText('#1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('나').length).toBeGreaterThan(0);
  });

  it('highlights the current user entry', async () => {
    const state = await buildLeaderboardPageState();
    const { container } = render(<LeaderboardClient entries={state.entries} />);
    const currentUserCard = container.querySelector(
      '[data-current-user="true"]'
    );

    expect(currentUserCard?.textContent).toContain('나');
  });

  it('focuses a selected user without renaming them as me', async () => {
    const state = await buildLeaderboardPageState({
      userId: 'user-2'
    });
    const { container } = render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
      />
    );

    const focusedUserCard = container.querySelector(
      '[data-focused-user="true"]'
    );

    expect(focusedUserCard?.textContent).toContain('user-2');
    expect(focusedUserCard?.textContent).not.toContain('나');
    expect(screen.getByText('선택한 사용자')).toBeTruthy();
    expect(screen.getAllByText('#1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('#2').length).toBeGreaterThan(0);
  });

  it('toggles between full ranking and nearby ranking views', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2'
    });

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
      />
    );

    expect(screen.getByText('랭킹')).toBeTruthy();
    expect(screen.queryByText('주변 순위')).toBeNull();

    await user.click(screen.getByRole('button', { name: '주변 순위 보기' }));

    expect(screen.getByText('주변 순위')).toBeTruthy();
    expect(screen.queryByText('랭킹')).toBeNull();
    expect(window.location.search).toContain('view=nearby');
  });

  it('returns focus to the current user', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2'
    });

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
      />
    );

    await user.click(
      screen.getByRole('button', { name: '내 위치로 돌아가기' })
    );

    expect(screen.getByText('내 위치')).toBeTruthy();
    expect(screen.getByText('현재 순위 #1 · 6pt')).toBeTruthy();
  });

  it('returns to the previous focused user from history', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2'
    });

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
      />
    );

    await user.click(screen.getByRole('button', { name: /나/ }));
    await user.click(
      screen.getByRole('button', { name: '이전 사용자로 돌아가기' })
    );

    expect(screen.getByText('선택한 사용자')).toBeTruthy();
    expect(screen.getByText('user-2 순위 #2 · 4pt')).toBeTruthy();
  });

  it('syncs focused user state into the url', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2'
    });

    window.history.replaceState(null, '', '/leaderboard');

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
      />
    );

    expect(window.location.search).toContain('userId=user-2');

    await user.click(
      screen.getByRole('button', { name: '내 위치로 돌아가기' })
    );

    expect(window.location.search).not.toContain('userId=');
  });

  it('copies the current focused leaderboard view link', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2',
      view: 'nearby'
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    const expectedUrl = `${window.location.origin}/leaderboard?userId=user-2&view=nearby`;

    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText
      }
    });

    window.history.replaceState(
      null,
      '',
      '/leaderboard?userId=user-2&view=nearby'
    );

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
        initialViewMode={state.initialViewMode}
      />
    );

    await user.click(screen.getByRole('button', { name: '현재 뷰 링크 복사' }));

    expect(writeText).toHaveBeenCalledWith(expectedUrl);
    expect(
      screen.getByText('user-2의 현재 순위는 #2, 점수는 4pt입니다.')
    ).toBeTruthy();
    expect(screen.getByText('현재 리더보드 링크를 복사했습니다.')).toBeTruthy();
  });

  it('shares the current focused leaderboard view with the web share api', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2',
      view: 'nearby'
    });
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: share
    });

    window.history.replaceState(
      null,
      '',
      '/leaderboard?userId=user-2&view=nearby'
    );

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
        initialViewMode={state.initialViewMode}
      />
    );

    await user.click(screen.getByRole('button', { name: '현재 뷰 공유' }));

    expect(share).toHaveBeenCalledWith({
      title: '주간 리더보드',
      text: 'user-2의 현재 순위는 #2, 점수는 4pt입니다.',
      url: `${window.location.origin}/leaderboard?userId=user-2&view=nearby`
    });
    expect(
      screen.getByText('현재 리더보드 공유 화면을 열었습니다.')
    ).toBeTruthy();
  });

  it('falls back to an external share url when web share is unavailable', async () => {
    const user = userEvent.setup();
    const state = await buildLeaderboardPageState({
      userId: 'user-2',
      view: 'nearby'
    });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: undefined
    });

    window.history.replaceState(
      null,
      '',
      '/leaderboard?userId=user-2&view=nearby'
    );

    render(
      <LeaderboardClient
        entries={state.entries}
        currentUserId={state.currentUserId}
        focusedUserId={state.focusedUserId}
        initialViewMode={state.initialViewMode}
      />
    );

    await user.click(screen.getByRole('button', { name: '현재 뷰 공유' }));

    const externalShareUrl = new URL(String(open.mock.calls[0]?.[0]));

    expect(open).toHaveBeenCalledTimes(1);
    expect(externalShareUrl.origin).toBe('https://twitter.com');
    expect(externalShareUrl.pathname).toBe('/intent/tweet');
    expect(externalShareUrl.searchParams.get('text')).toBe(
      'user-2의 현재 순위는 #2, 점수는 4pt입니다.'
    );
    expect(externalShareUrl.searchParams.get('url')).toBe(
      `${window.location.origin}/leaderboard?userId=user-2&view=nearby`
    );
    expect(
      screen.getByText('현재 리더보드 공유 화면을 열었습니다.')
    ).toBeTruthy();
  });

  it('shows a fallback when the leaderboard is empty', () => {
    render(<LeaderboardClient entries={[]} />);

    expect(screen.getByText('아직 리더보드 데이터가 없습니다.')).toBeTruthy();
  });

  it('applies the incoming recommendation score to the leaderboard state', async () => {
    const repository = new InMemoryLeaderboardRepository();
    const state = await buildLeaderboardPageState(
      {
        source: 'recommendation',
        score: '2',
        userId: 'demo-user'
      },
      repository
    );

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
    expect(screen.getAllByText('6 pt').length).toBeGreaterThan(0);
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
