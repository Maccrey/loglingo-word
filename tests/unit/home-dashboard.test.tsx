// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomeDashboard from '../../apps/web/src/app/HomeDashboard';

vi.mock('../../apps/web/src/lib/useCat', () => ({
  useCat: vi.fn()
}));

const { useCat } = await import('../../apps/web/src/lib/useCat');

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(useCat).mockReturnValue({
    cat: {
      id: 'cat-1',
      userId: 'demo-user',
      name: '나비',
      stage: 'kitten',
      status: 'healthy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastFedAt: Date.now(),
      lastWashedAt: Date.now(),
      lastPlayedAt: Date.now(),
      activeDays: 1
    },
    points: 5000,
    currentStatus: 'healthy',
    handleFeed: vi.fn(() => true),
    handleWash: vi.fn(() => true),
    handlePlay: vi.fn(() => true),
    handleHeal: vi.fn(() => true)
  });
});

describe('home dashboard', () => {
  it('renders the main summary cards', () => {
    const { container } = render(
      <HomeDashboard
        leaderboardPreview={{
          weekId: '2026-W13',
          myRank: 2,
          topEntries: [
            {
              userId: 'user-2',
              rank: 1,
              score: 8,
              isCurrentUser: false
            },
            {
              userId: 'demo-user',
              rank: 2,
              score: 4,
              isCurrentUser: true
            }
          ]
        }}
      />
    );

    expect(screen.getAllByText('오늘 할 학습').length).toBeGreaterThan(0);
    expect(screen.getAllByText('연속 학습 streak').length).toBeGreaterThan(0);
    expect(screen.getAllByText('누적 포인트').length).toBeGreaterThan(0);
    expect(screen.getAllByText('주간 리더보드 점수').length).toBeGreaterThan(0);
    expect(screen.getByText('이번 주 순위 #2')).toBeTruthy();
    expect(screen.getByText('2026-W13')).toBeTruthy();
    const summaryGrid = container.querySelector('[data-testid="home-summary-grid"]');
    const dailyGoalCard = container.querySelector('[data-testid="home-daily-goal-card"]');
    const wideCards = container.querySelectorAll('.home-summary-grid__wide');
    expect(summaryGrid).toBeTruthy();
    expect(dailyGoalCard).toBeTruthy();
    expect(summaryGrid?.contains(dailyGoalCard ?? null)).toBe(true);
    expect(wideCards.length).toBe(2);
    expect(
      screen
        .getByRole('link', { name: '리더보드에서 user-2 보기' })
        .getAttribute('href')
    ).toBe('/leaderboard?userId=user-2&view=nearby');
  });

  it('renders a quick start link to the study flow', () => {
    render(<HomeDashboard />);

    const quickStart = screen.getByRole('link', { name: '바로 시작' });
    expect(quickStart.getAttribute('href')).toBe('/learn');
    expect(screen.getByText('지금 필요한 돌봄')).toBeTruthy();
    expect(screen.getByText('오늘 15분 학습이면 충분해요')).toBeTruthy();
  });

  it('renders the cat card and quick start panel in the same feature row', () => {
    const { container } = render(<HomeDashboard />);

    const featureRow = container.querySelector('.home-feature-row');
    const catArea = container.querySelector('.home-feature-row__cat');
    const quickArea = container.querySelector('.home-feature-row__quick');

    expect(featureRow).toBeTruthy();
    expect(catArea).toBeTruthy();
    expect(quickArea).toBeTruthy();
    expect(featureRow?.contains(catArea ?? null)).toBe(true);
    expect(featureRow?.contains(quickArea ?? null)).toBe(true);
  });

  it('shows the loading state when dashboard data is pending', () => {
    render(<HomeDashboard loading />);

    expect(screen.getByText('대시보드 데이터를 불러오는 중...')).toBeTruthy();
  });

  it('switches text when the locale changes', () => {
    render(<HomeDashboard locale="en" />);

    expect(screen.getAllByText("Today's Learning Flow").length).toBeGreaterThan(
      0
    );
    expect(screen.getByRole('link', { name: 'Quick Start' })).toBeTruthy();
  });

  it('requests and renders weekly recommendations', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          recommendation: {
            words: ['passport', 'subway', 'reservation'],
            requestedAt: '2026-03-26T00:00:00.000Z',
            weekId: '2026-W13'
          }
        })
      }))
    );

    render(<HomeDashboard />);

    await user.click(screen.getByRole('button', { name: '추천 받기' }));

    await waitFor(() => {
      expect(screen.getByText('passport')).toBeTruthy();
    });
    expect(screen.getByText('subway')).toBeTruthy();
    expect(screen.getByText('reservation')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '추천 학습 시작' }).getAttribute('href')
    ).toBe('/learn?focus=passport%2Csubway%2Creservation');
  });

  it('applies pending recommendation totals to the home summary', () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({})
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <HomeDashboard
        pendingSource="recommendation"
        pendingPoints="10"
        pendingLeaderboardScore="2"
        leaderboardPreview={{
          weekId: '2026-W13',
          myRank: 2,
          topEntries: [
            {
              userId: 'user-2',
              rank: 1,
              score: 3,
              isCurrentUser: false
            },
            {
              userId: 'demo-user',
              rank: 2,
              score: 1,
              isCurrentUser: true
            }
          ]
        }}
      />
    );

    expect(screen.getByText('학습 반영 완료')).toBeTruthy();
    expect(
      screen.getByText(/추천 학습 결과가 홈 요약에 반영됐습니다\./)
    ).toBeTruthy();
    expect(screen.getByText('55 pt')).toBeTruthy();
    expect(screen.getByText('2 pt')).toBeTruthy();
    expect(screen.getByText('이번 주 순위 #1')).toBeTruthy();
    expect(screen.getAllByText('3 pt').length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/dashboard/sync',
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  it('uses persisted dashboard stats as the base summary points', () => {
    render(
      <HomeDashboard
        initialStats={{
          userId: 'demo-user',
          totalPoints: 120,
          leaderboardScore: 4,
          updatedAt: '2026-03-26T00:00:00.000Z'
        }}
      />
    );

    expect(screen.getByText('120 pt')).toBeTruthy();
    expect(screen.getByText('4 pt')).toBeTruthy();
  });

  it('shows an empty leaderboard preview message when no weekly entry exists', () => {
    render(
      <HomeDashboard
        leaderboardPreview={{
          weekId: '2026-W13',
          myRank: null,
          topEntries: []
        }}
      />
    );

    expect(
      screen.getByText('이번 주 리더보드 기록이 아직 없습니다.')
    ).toBeTruthy();
  });

  it('shows a cat care warning summary in the quick start panel', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '나비',
        stage: 'kitten',
        status: 'stressed',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now(),
        lastWashedAt: Date.now(),
        lastPlayedAt: Date.now() - 13 * 60 * 60 * 1000,
        activeDays: 1
      },
      points: 5000,
      currentStatus: 'stressed',
      handleFeed: vi.fn(() => true),
      handleWash: vi.fn(() => true),
      handlePlay: vi.fn(() => true),
      handleHeal: vi.fn(() => true)
    });

    render(<HomeDashboard />);

    expect(screen.getByText('15시간 전에 놀아줘야 해요')).toBeTruthy();
    expect(
      screen.getByText(/스트레스 질병 구간에 가까워지고 있습니다\./)
    ).toBeTruthy();
  });
});
