// @vitest-environment jsdom

import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Cat, PointLedger } from '../../packages/shared/src/cat';
import { saveStoredCat, saveStoredCatLedgers } from '../../apps/web/src/lib/catStorage';
import { useCat } from '../../apps/web/src/lib/useCat';

const syncCatMock = vi.fn(async () => true);
const syncPendingPointsMock = vi.fn(async () => true);
const useAppAuthMock = vi.fn(() => ({
  authReady: true,
  isAuthenticated: true,
  userId: 'demo-user'
}));
const loadFirebaseCatStateMock = vi.fn(async () => null);
const loadFirebasePointLedgerStateMock = vi.fn(async () => null);

vi.mock('../../apps/web/src/lib/useCatSync', () => ({
  useCatSync: () => ({
    syncCat: syncCatMock,
    syncState: {
      loading: false,
      syncedAt: null,
      error: null
    }
  })
}));

vi.mock('../../apps/web/src/lib/usePointSync', () => ({
  usePointSync: () => ({
    syncPendingPoints: syncPendingPointsMock,
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
  loadFirebaseCatState: (...args: unknown[]) => loadFirebaseCatStateMock(...args),
  loadFirebasePointLedgerState: (...args: unknown[]) =>
    loadFirebasePointLedgerStateMock(...args)
}));

const sickCat: Cat = {
  id: 'cat-1',
  userId: 'demo-user',
  name: '로그링고',
  stage: 'kitten',
  status: 'sick',
  createdAt: 1,
  updatedAt: 1,
  lastFedAt: 1,
  lastWashedAt: 1,
  lastPlayedAt: 1,
  activeDays: 1
};

const ledgers: PointLedger[] = [];

function UseCatSummary({ name }: { name: string }) {
  const { currentStatus, handleHeal } = useCat();

  return (
    <section>
      <span>{name}:{currentStatus}</span>
      <button onClick={() => handleHeal()}>heal-{name}</button>
    </section>
  );
}

describe('useCat shared state', () => {
  beforeEach(() => {
    syncCatMock.mockClear();
    syncPendingPointsMock.mockClear();
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
    window.localStorage.clear();
    const now = new Date('2026-03-27T00:00:00.000Z').getTime();
    vi.useFakeTimers();
    vi.setSystemTime(now);
    saveStoredCat({
      ...sickCat,
      createdAt: now - 24 * 60 * 60 * 1000,
      updatedAt: now - 24 * 60 * 60 * 1000,
      lastFedAt: now - 10 * 60 * 60 * 1000,
      lastWashedAt: now - 73 * 60 * 60 * 1000,
      lastPlayedAt: now - 10 * 60 * 60 * 1000
    });
    saveStoredCatLedgers(ledgers);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('updates all hook consumers when one component heals the cat', async () => {
    render(
      <>
        <UseCatSummary name="left" />
        <UseCatSummary name="right" />
      </>
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('left:sick')).toBeTruthy();
    expect(screen.getByText('right:sick')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'heal-left' }));
      await Promise.resolve();
    });

    expect(screen.getByText('left:healthy')).toBeTruthy();
    expect(screen.getByText('right:healthy')).toBeTruthy();
  });
});
