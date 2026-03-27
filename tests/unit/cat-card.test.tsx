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
  it('shows a point shortage guide and study cta when care points are low', () => {
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
      points: 20,
      currentStatus: 'healthy',
      handleFeed: vi.fn(() => false),
      handleWash: vi.fn(() => false),
      handlePlay: vi.fn(() => false),
      handleHeal: vi.fn(() => false)
    });

    render(<CatCard />);

    expect(
      screen.getByText(
        '돌봄 포인트가 80pt 부족해요. 바로 학습 시작으로 포인트를 모아보세요.'
      )
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '바로 시작' }).getAttribute('href')
    ).toBe('/learn');
  });
});
