import { z } from 'zod';

import { type PointLedger } from '@wordflow/shared/cat';

export const pointLedgerSyncInputSchema = z.object({
  userId: z.string().min(1),
  ledgers: z.array(z.custom<PointLedger>()).min(1),
  syncedAt: z.string().datetime()
});

export const pointLedgerSyncRecordSchema = z.object({
  userId: z.string().min(1),
  ledgers: z.array(z.custom<PointLedger>()),
  syncedAt: z.string().datetime()
});

export type PointLedgerSyncInput = z.infer<typeof pointLedgerSyncInputSchema>;
export type PointLedgerSyncRecord = z.infer<typeof pointLedgerSyncRecordSchema>;

export type PointLedgerSyncRepository = {
  findByUserId(userId: string): Promise<PointLedgerSyncRecord | null>;
  save(record: PointLedgerSyncRecord): Promise<PointLedgerSyncRecord>;
};

export type PointLedgerSyncDocumentStore = {
  get(userId: string): Promise<PointLedgerSyncRecord | null>;
  set(record: PointLedgerSyncRecord): Promise<void>;
};

export async function syncPointLedgers(
  input: PointLedgerSyncInput,
  repository: PointLedgerSyncRepository
): Promise<PointLedgerSyncRecord> {
  const validatedInput = pointLedgerSyncInputSchema.parse(input);
  const current = await repository.findByUserId(validatedInput.userId);

  const mergedLedgers = [...(current?.ledgers ?? []), ...validatedInput.ledgers];
  const dedupedLedgers = Array.from(
    new Map(mergedLedgers.map((ledger) => [ledger.id, ledger])).values()
  ).sort((left, right) => left.createdAt - right.createdAt);

  const nextRecord = pointLedgerSyncRecordSchema.parse({
    userId: validatedInput.userId,
    ledgers: dedupedLedgers,
    syncedAt: validatedInput.syncedAt
  });

  return repository.save(nextRecord);
}

export class InMemoryPointLedgerSyncRepository
  implements PointLedgerSyncRepository
{
  private readonly store = new Map<string, PointLedgerSyncRecord>();

  async findByUserId(userId: string): Promise<PointLedgerSyncRecord | null> {
    return this.store.get(userId) ?? null;
  }

  async save(record: PointLedgerSyncRecord): Promise<PointLedgerSyncRecord> {
    this.store.set(record.userId, record);
    return record;
  }
}

export class FirestorePointLedgerSyncRepository
  implements PointLedgerSyncRepository
{
  constructor(private readonly store: PointLedgerSyncDocumentStore) {}

  async findByUserId(userId: string): Promise<PointLedgerSyncRecord | null> {
    return this.store.get(userId);
  }

  async save(record: PointLedgerSyncRecord): Promise<PointLedgerSyncRecord> {
    await this.store.set(record);
    return record;
  }
}
