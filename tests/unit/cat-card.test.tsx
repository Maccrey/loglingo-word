// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      src: string;
      alt: string;
    }
  ) => <img {...props} />
}));

import CatCard from '../../apps/web/src/components/CatCard';

vi.mock('../../apps/web/src/lib/useCat', () => ({
  useCat: vi.fn()
}));

const { useCat } = await import('../../apps/web/src/lib/useCat');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
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

  it('shows the stage-specific medicine overlay after treatment', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
        stage: 'adult',
        status: 'sick',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now() - 10 * 60 * 60 * 1000,
        lastWashedAt: Date.now() - 73 * 60 * 60 * 1000,
        lastPlayedAt: Date.now() - 10 * 60 * 60 * 1000,
        activeDays: 90
      },
      points: 5000,
      currentStatus: 'sick',
      handleFeed: vi.fn(() => true),
      handleWash: vi.fn(() => true),
      handlePlay: vi.fn(() => true),
      handleHeal: vi.fn(() => true)
    });

    render(<CatCard />);

    fireEvent.click(screen.getByRole('button', { name: /치료하기/ }));

    expect(
      screen.getByAltText('adult cat feeling sick').getAttribute('src')
    ).toContain('adult_action_medicine.png');
  });
});
