// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CatCard from '../../apps/web/src/components/CatCard';

vi.mock('../../apps/web/src/lib/useCat', () => ({
  useCat: vi.fn()
}));

const { useCat } = await import('../../apps/web/src/lib/useCat');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('cat card', () => {
  it('shows a point shortage guide and study cta for the required care action', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
        stage: 'kitten',
        status: 'sick',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now() - 10 * 60 * 60 * 1000,
        lastWashedAt: Date.now() - 73 * 60 * 60 * 1000,
        lastPlayedAt: Date.now() - 10 * 60 * 60 * 1000,
        activeDays: 1
      },
      points: 20,
      currentStatus: 'sick',
      handleFeed: vi.fn(() => false),
      handleWash: vi.fn(() => false),
      handlePlay: vi.fn(() => false),
      handleHeal: vi.fn(() => false)
    });

    render(<CatCard />);

    expect(
      screen.getByText(
        '치료하기에 필요한 돌봄 포인트가 980pt 부족해요. 바로 학습 시작으로 포인트를 모아보세요.'
      )
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '바로 시작' }).getAttribute('href')
    ).toBe('/learn');
  });

  it('shows a stress warning banner when the play warning threshold has passed', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
        stage: 'kitten',
        status: 'stressed',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now(),
        lastWashedAt: Date.now(),
        lastPlayedAt: Date.now() - 13 * 60 * 60 * 1000,
        activeDays: 1
      },
      points: 500,
      currentStatus: 'stressed',
      handleFeed: vi.fn(() => false),
      handleWash: vi.fn(() => false),
      handlePlay: vi.fn(() => false),
      handleHeal: vi.fn(() => false)
    });

    render(<CatCard />);

    expect(screen.getByText('지금 필요한 돌봄: 15시간 전에 놀아주기')).toBeTruthy();
    expect(
      screen.getByText('스트레스 경고 구간이에요. 학습 포인트가 있으면 먼저 놀아주는 편이 안전합니다.')
    ).toBeTruthy();
  });
});
