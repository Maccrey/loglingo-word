import { describe, expect, it } from 'vitest';

import {
  InMemoryPointLedgerSyncRepository,
  syncPointLedgers
} from '../../services/core/src/point-sync';

describe('point ledger sync', () => {
  it('persists ledgers into the repository and deduplicates by id', async () => {
    const repository = new InMemoryPointLedgerSyncRepository();

    const result = await syncPointLedgers(
      {
        userId: 'demo-user',
        syncedAt: '2026-03-27T00:00:00.000Z',
        ledgers: [
          {
            id: 'ledger-1',
            userId: 'demo-user',
            amount: -100,
            reason: 'cat_care_feed',
            createdAt: 1
          },
          {
            id: 'ledger-1',
            userId: 'demo-user',
            amount: -100,
            reason: 'cat_care_feed',
            createdAt: 1
          }
        ]
      },
      repository
    );

    expect(result.ledgers).toHaveLength(1);
    expect((await repository.findByUserId('demo-user'))?.ledgers).toHaveLength(1);
  });
});
