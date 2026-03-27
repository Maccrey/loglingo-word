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

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams()
}));

import CatDetailScreen from '../../apps/web/src/app/cat/page';

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
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('cat detail page', () => {
  it('renders the cat detail heading, timer cards and action buttons', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
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

    render(<CatDetailScreen />);

    expect(screen.getByText('로그링고 상세 정보')).toBeTruthy();
    expect(
      screen.getByText(
        '로그링고가 안정적인 상태예요. 지금처럼 학습과 돌봄을 이어가면 됩니다.'
      )
    ).toBeTruthy();
    expect(screen.getByText('상태 게이지')).toBeTruthy();
    expect(screen.getByText('급식 타이머')).toBeTruthy();
    expect(screen.getByText('청결 타이머')).toBeTruthy();
    expect(screen.getByText('놀이 타이머')).toBeTruthy();
    expect(screen.getByRole('button', { name: /밥주기/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /놀아주기/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /씻기기/ })).toBeTruthy();
  });

  it('shows a stress warning alert when play time passes the warning threshold', () => {
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
      points: 5000,
      currentStatus: 'stressed',
      handleFeed: vi.fn(() => true),
      handleWash: vi.fn(() => true),
      handlePlay: vi.fn(() => true),
      handleHeal: vi.fn(() => true)
    });

    render(<CatDetailScreen />);

    expect(screen.getByText(/스트레스 경고 구간이에요/)).toBeTruthy();
    expect(
      screen.getByText(
        '스트레스 경고: 마지막으로 놀아준 지 13시간이 지났어요. 15시간 전에 놀아주면 아프지 않게 유지할 수 있습니다.'
      )
    ).toBeTruthy();
  });

  it('shows the growth summary section', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
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

    render(<CatDetailScreen />);

    expect(screen.getByText('성장 기록')).toBeTruthy();
    expect(screen.getByText(/현재 단계:/)).toBeTruthy();
    expect(screen.getByText(/건강하게 키운 일수:/)).toBeTruthy();
  });

  it('shows the cat slot list with a locked reward slot', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
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

    render(<CatDetailScreen />);

    expect(screen.getByText('고양이 슬롯')).toBeTruthy();
    expect(screen.getByText('대표 고양이')).toBeTruthy();
    expect(screen.getByText('추가 슬롯')).toBeTruthy();
    expect(
      screen.getByText('1년 육성 보상으로 새끼 고양이를 해금하면 열립니다.')
    ).toBeTruthy();
  });

  it('shows the stage-specific medicine overlay after treatment', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
        stage: 'senior',
        status: 'sick',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now() - 10 * 60 * 60 * 1000,
        lastWashedAt: Date.now() - 73 * 60 * 60 * 1000,
        lastPlayedAt: Date.now() - 10 * 60 * 60 * 1000,
        activeDays: 220
      },
      points: 5000,
      currentStatus: 'sick',
      handleFeed: vi.fn(() => true),
      handleWash: vi.fn(() => true),
      handlePlay: vi.fn(() => true),
      handleHeal: vi.fn(() => true)
    });

    render(<CatDetailScreen />);

    fireEvent.click(screen.getByRole('button', { name: /치료하기/ }));

    expect(screen.getByAltText('Cat Large View').getAttribute('src')).toContain(
      'senior_action_medicine.png'
    );
  });

  it('emphasizes the required care button for sick and critical states', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
        stage: 'senior',
        status: 'critical',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now() - 10 * 60 * 60 * 1000,
        lastWashedAt: Date.now() - 73 * 60 * 60 * 1000,
        lastPlayedAt: Date.now() - 20 * 60 * 60 * 1000,
        activeDays: 220
      },
      points: 5000,
      currentStatus: 'critical',
      handleFeed: vi.fn(() => true),
      handleWash: vi.fn(() => true),
      handlePlay: vi.fn(() => true),
      handleHeal: vi.fn(() => true)
    });

    render(<CatDetailScreen />);

    expect(
      screen.getByRole('button', { name: /치료하기/ }).getAttribute('style')
    ).toContain('background: rgb(190, 18, 60)');
  });
});
