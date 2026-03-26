// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomeDashboard from '../../apps/web/src/app/HomeDashboard';

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('home dashboard', () => {
  it('renders the main summary cards', () => {
    render(<HomeDashboard />);

    expect(screen.getAllByText('오늘 할 학습').length).toBeGreaterThan(0);
    expect(screen.getAllByText('연속 학습 streak').length).toBeGreaterThan(0);
    expect(screen.getAllByText('누적 포인트').length).toBeGreaterThan(0);
  });

  it('renders a quick start link to the study flow', () => {
    render(<HomeDashboard />);

    const quickStart = screen.getByRole('link', { name: '바로 시작' });
    expect(quickStart.getAttribute('href')).toBe('/learn');
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
      />
    );

    expect(screen.getByText('학습 반영 완료')).toBeTruthy();
    expect(
      screen.getByText(/추천 학습 결과가 홈 요약에 반영됐습니다\./)
    ).toBeTruthy();
    expect(screen.getByText('55 pt')).toBeTruthy();
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
  });
});
