import { z } from 'zod';

import { type Cat } from '@wordflow/shared/cat';

const catSyncRecordSchema = z.object({
  userId: z.string().min(1),
  cat: z.custom<Cat>(),
  syncedAt: z.string().datetime()
});

export const catSyncInputSchema = z.object({
  userId: z.string().min(1),
  cat: z.custom<Cat>(),
  syncedAt: z.string().datetime()
});

export type CatSyncInput = z.infer<typeof catSyncInputSchema>;
export type CatSyncRecord = z.infer<typeof catSyncRecordSchema>;

export type CatStateRepository = {
  findByUserId(userId: string): Promise<CatSyncRecord | null>;
  save(record: CatSyncRecord): Promise<CatSyncRecord>;
};

export type CatStateDocumentStore = {
  get(userId: string): Promise<CatSyncRecord | null>;
  set(record: CatSyncRecord): Promise<void>;
};

export async function syncCatState(
  input: CatSyncInput,
  repository: CatStateRepository
): Promise<CatSyncRecord> {
  const validatedInput = catSyncInputSchema.parse(input);
  const nextRecord = catSyncRecordSchema.parse(validatedInput);

  return repository.save(nextRecord);
}

export class InMemoryCatStateRepository implements CatStateRepository {
  private readonly store = new Map<string, CatSyncRecord>();

  async findByUserId(userId: string): Promise<CatSyncRecord | null> {
    return this.store.get(userId) ?? null;
  }

  async save(record: CatSyncRecord): Promise<CatSyncRecord> {
    this.store.set(record.userId, record);
    return record;
  }
}

export class FirestoreCatStateRepository implements CatStateRepository {
  constructor(private readonly store: CatStateDocumentStore) {}

  async findByUserId(userId: string): Promise<CatSyncRecord | null> {
    return this.store.get(userId);
  }

  async save(record: CatSyncRecord): Promise<CatSyncRecord> {
    await this.store.set(record);
    return record;
  }
}
