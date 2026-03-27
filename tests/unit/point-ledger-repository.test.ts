import { describe, expect, it } from 'vitest';

import { getPointLedgerSyncRepository } from '../../apps/web/src/lib/point-ledger-repository';

describe('point ledger repository', () => {
  it('reuses the in-memory repository instance when firebase is not configured', async () => {
    const repository = getPointLedgerSyncRepository();

    await repository.save({
      userId: 'demo-user',
      syncedAt: '2026-03-27T00:00:00.000Z',
      ledgers: [
        {
          id: 'ledger-1',
          userId: 'demo-user',
          amount: -150,
          reason: 'cat_care_wash',
          createdAt: 1
        }
      ]
    });

    const repeatedLookup =
      await getPointLedgerSyncRepository().findByUserId('demo-user');

    expect(repeatedLookup?.ledgers).toHaveLength(1);
    expect(repeatedLookup?.ledgers[0]?.reason).toBe('cat_care_wash');
  });
});
