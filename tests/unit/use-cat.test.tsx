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
const useAppAuthMock = vi.fn(() => ({
  authReady: true,
  isAuthenticated: true,
  userId: 'demo-user'
}));
const loadFirebaseCatStateMock = vi.fn(async () => null);
const loadFirebasePointLedgerStateMock = vi.fn(async () => null);

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

vi.mock('../../apps/web/src/lib/useAppAuth', () => ({
  useAppAuth: () => useAppAuthMock()
}));

vi.mock('../../apps/web/src/lib/firebase-client', () => ({
  hasFirebaseWebConfig: vi.fn(() => true),
  loadFirebaseCatState: (...args: unknown[]) => loadFirebaseCatStateMock(...args),
  loadFirebasePointLedgerState: (...args: unknown[]) =>
    loadFirebasePointLedgerStateMock(...args)
}));

function UseCatHarness() {
  const { cat, points, handleFeed, grantLearningReward } = useCat();

  return (
    <div>
      <span>{cat?.name ?? '없음'}</span>
      <span>{points}</span>
      <button onClick={() => handleFeed()}>feed</button>
      <button
        onClick={() =>
          grantLearningReward({
            wordsMemorized: 3
          })
        }
      >
        reward
      </button>
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
    loadFirebaseCatStateMock.mockReset();
    loadFirebaseCatStateMock.mockResolvedValue(null);
    loadFirebasePointLedgerStateMock.mockReset();
    loadFirebasePointLedgerStateMock.mockResolvedValue(null);
    useAppAuthMock.mockReset();
    useAppAuthMock.mockReturnValue({
      authReady: true,
      isAuthenticated: true,
      userId: 'demo-user'
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('syncs cat state and pending ledgers after a care action', async () => {
    render(<UseCatHarness />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('로그링고')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'feed' }));
      await Promise.resolve();
    });

    expect(syncCat.mock.calls.length).toBeGreaterThanOrEqual(1);
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
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('로그링고')).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    expect(syncCat.mock.calls.length).toBeGreaterThanOrEqual(1);
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

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('로그링고')).toBeTruthy();
    expect(saveStoredCat).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '로그링고'
      }),
      false
    );
  });

  it('loads stored guest progress from local storage when logged out', async () => {
    const { loadStoredCat, loadStoredCatLedgers } = await import('../../apps/web/src/lib/catStorage');
    vi.mocked(loadStoredCat).mockReturnValueOnce({
      ...mockCat,
      name: '저장된 고양이',
      activeDays: 3
    });
    vi.mocked(loadStoredCatLedgers).mockReturnValueOnce([
      {
        id: 'ledger-1',
        userId: 'demo-user',
        amount: -100,
        reason: 'cat_care_feed',
        createdAt: 1
      }
    ]);
    useAppAuthMock.mockReturnValue({
      authReady: true,
      isAuthenticated: false,
      userId: 'demo-user'
    });

    render(<UseCatHarness />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText('저장된 고양이')).toBeTruthy();
    expect(screen.queryByText('로그링고')).toBeNull();
    expect(saveStoredCat).not.toHaveBeenCalled();
    expect(saveStoredCatLedgers).not.toHaveBeenCalled();
    expect(syncCat).not.toHaveBeenCalled();
    expect(syncPendingPoints).not.toHaveBeenCalled();
  });

  it('persists guest care actions to local storage without syncing to Firebase', async () => {
    useAppAuthMock.mockReturnValue({
      authReady: true,
      isAuthenticated: false,
      userId: 'demo-user'
    });

    render(<UseCatHarness />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'feed' }));
      await Promise.resolve();
    });

    expect(saveStoredCat).toHaveBeenCalled();
    expect(saveStoredCatLedgers).toHaveBeenCalled();
    expect(syncCat).not.toHaveBeenCalled();
    expect(syncPendingPoints).not.toHaveBeenCalled();
  });

  it('promotes stored guest progress to Firebase after login when no remote state exists', async () => {
    const storedGuestCat = {
      ...mockCat,
      userId: 'demo-user',
      name: '게스트 고양이',
      activeDays: 5
    };
    const storedGuestLedgers = [
      {
        id: 'ledger-1',
        userId: 'demo-user',
        amount: -100,
        reason: 'cat_care_feed',
        createdAt: 1
      }
    ];
    const { loadStoredCat, loadStoredCatLedgers } = await import('../../apps/web/src/lib/catStorage');
    vi.mocked(loadStoredCat).mockReturnValueOnce(storedGuestCat);
    vi.mocked(loadStoredCatLedgers).mockReturnValueOnce(storedGuestLedgers);

    render(<UseCatHarness />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText('게스트 고양이')).toBeTruthy();
    expect(syncCat).toHaveBeenCalledWith(
      'demo-user',
      expect.objectContaining({
        name: '게스트 고양이',
        activeDays: 5,
        userId: 'demo-user'
      })
    );
    expect(syncPendingPoints).toHaveBeenCalledWith(
      'demo-user',
      [
        expect.objectContaining({
          amount: -100,
          reason: 'cat_care_feed',
          userId: 'demo-user'
        })
      ]
    );
    expect(saveStoredCat).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '게스트 고양이'
      }),
      false
    );
    expect(saveStoredCatLedgers).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          amount: -100,
          reason: 'cat_care_feed',
          userId: 'demo-user'
        })
      ],
      false
    );
  });

  it('grants learning reward points and syncs them for authenticated users', async () => {
    render(<UseCatHarness />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'reward' }));
      await Promise.resolve();
    });

    expect(syncPendingPoints).toHaveBeenCalledWith(
      'demo-user',
      [
        expect.objectContaining({
          userId: 'demo-user',
          amount: 30,
          reason: 'learning_reward'
        })
      ]
    );
    expect(saveStoredCatLedgers).toHaveBeenCalled();
    expect(screen.getByText('5030')).toBeTruthy();
  });

  it('stores learning reward points locally for guests without Firebase sync', async () => {
    useAppAuthMock.mockReturnValue({
      authReady: true,
      isAuthenticated: false,
      userId: 'demo-user'
    });

    render(<UseCatHarness />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'reward' }));
      await Promise.resolve();
    });

    expect(saveStoredCatLedgers).toHaveBeenCalled();
    expect(syncPendingPoints).not.toHaveBeenCalled();
    expect(screen.getByText('5030')).toBeTruthy();
  });
});
