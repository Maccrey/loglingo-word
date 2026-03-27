// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import type { Cat, PointLedger } from '../../packages/shared/src/cat';
import {
  loadStoredCat,
  loadStoredCatLedgers,
  saveStoredCat,
  saveStoredCatLedgers
} from '../../apps/web/src/lib/catStorage';

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

const mockLedgers: PointLedger[] = [
  {
    id: 'ledger-1',
    userId: 'demo-user',
    amount: -100,
    reason: 'cat_care_feed',
    createdAt: 1
  }
];

describe('cat storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and loads cat state', () => {
    saveStoredCat(mockCat);

    expect(loadStoredCat()).toEqual(mockCat);
  });

  it('stores and loads point ledgers', () => {
    saveStoredCatLedgers(mockLedgers);

    expect(loadStoredCatLedgers()).toEqual(mockLedgers);
  });

  it('returns empty defaults when storage is missing', () => {
    expect(loadStoredCat()).toBeNull();
    expect(loadStoredCatLedgers()).toEqual([]);
  });
});
