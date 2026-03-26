import { describe, it, expect } from 'vitest';
import { createPointLedgerEntry, getPointBalance } from '../../services/core/src/point';
import type { PointLedger } from '@wordflow/shared/cat';

describe('Point Ledger Service', () => {
  it('should create a valid ledger entry', () => {
    const entry = createPointLedgerEntry('user-1', 500, 'learning_reward');
    expect(entry.userId).toBe('user-1');
    expect(entry.amount).toBe(500);
    expect(entry.reason).toBe('learning_reward');
    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeGreaterThan(0);
  });

  it('should correctly calculate balance from multiple ledgers', () => {
    const ledgers: PointLedger[] = [
      createPointLedgerEntry('user-1', 1000, 'daily_bonus'),
      createPointLedgerEntry('user-1', -150, 'cat_care_wash'),
      createPointLedgerEntry('user-1', -100, 'cat_care_feed'),
      createPointLedgerEntry('user-1', 200, 'learning_reward'),
    ];

    const balance = getPointBalance(ledgers);
    // 1000 - 150 - 100 + 200 = 950
    expect(balance).toBe(950);
  });

  it('should return 0 for an empty ledger array', () => {
    expect(getPointBalance([])).toBe(0);
  });
});
