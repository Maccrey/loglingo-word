// @vitest-environment jsdom

import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Cat } from '../../packages/shared/src/cat';
import { useCat } from '../../apps/web/src/lib/useCat';

const mockCat: Cat = {
  id: 'cat-1',
  userId: 'demo-user',
  name: '로그링고',
  stage: 'kitten',
  status: 'healthy',
  createdAt: 1,
  updatedAt: 1,
  lastFedAt: 1,
  lastWashedAt: 1,
  lastPlayedAt: 1,
  activeDays: 0
};

const saveStoredCat = vi.fn();
const saveStoredCatLedgers = vi.fn();
const syncCat = vi.fn(async () => true);
const syncPendingPoints = vi.fn(async () => true);

vi.mock('../../apps/web/src/lib/catStorage', () => ({
  CAT_STORAGE_UPDATED_EVENT: 'cat-storage-updated',
  loadStoredCat: vi.fn(() => mockCat),
  loadStoredCatLedgers: vi.fn(() => []),
  saveStoredCat: (...args: unknown[]) => saveStoredCat(...args),
  saveStoredCatLedgers: (...args: unknown[]) => saveStoredCatLedgers(...args)
}));

vi.mock('../../apps/web/src/lib/useCatSync', () => ({
  useCatSync: () => ({
    syncCat,
    syncState: {
      loading: false,
      syncedAt: null,
      error: null
    }
  })
}));

vi.mock('../../apps/web/src/lib/usePointSync', () => ({
  usePointSync: () => ({
    syncPendingPoints,
    syncState: {
      loading: false,
      syncedAt: null,
      error: null
    }
  })
}));

function UseCatHarness() {
  const { cat, handleFeed } = useCat();

  return (
    <div>
      <span>{cat?.name ?? '없음'}</span>
      <button onClick={() => handleFeed()}>feed</button>
    </div>
  );
}

describe('useCat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-27T00:00:00.000Z'));
    saveStoredCat.mockReset();
    saveStoredCatLedgers.mockReset();
    syncCat.mockClear();
    syncPendingPoints.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('syncs cat state and pending ledgers after a care action', async () => {
    render(<UseCatHarness />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'feed' }));
      await Promise.resolve();
    });

    expect(syncCat).toHaveBeenCalledTimes(1);
    expect(syncPendingPoints).toHaveBeenCalledTimes(1);
    expect(saveStoredCat).toHaveBeenCalled();
    expect(saveStoredCatLedgers).toHaveBeenCalled();
    expect(syncCat).toHaveBeenCalledWith(
      'demo-user',
      expect.objectContaining({
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고'
      })
    );
    expect(syncPendingPoints).toHaveBeenCalledWith(
      'demo-user',
      [
        expect.objectContaining({
          userId: 'demo-user',
          amount: -100,
          reason: 'cat_care_feed'
        })
      ]
    );
  });

  it('syncs recalculated cat state on the polling interval', async () => {
    render(<UseCatHarness />);

    await act(async () => {
      vi.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(syncCat).toHaveBeenCalledTimes(1);
    expect(saveStoredCat).toHaveBeenCalled();
    expect(syncPendingPoints).not.toHaveBeenCalled();
  });

  it('migrates a previously stored cat name from 나비 to 로그링고', async () => {
    const legacyCat = {
      ...mockCat,
      name: '나비'
    };
    const { loadStoredCat } = await import('../../apps/web/src/lib/catStorage');
    vi.mocked(loadStoredCat).mockReturnValueOnce(legacyCat);

    render(<UseCatHarness />);

    expect(screen.getByText('로그링고')).toBeTruthy();
    expect(saveStoredCat).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '로그링고'
      })
    );
  });
});
