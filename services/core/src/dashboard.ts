import { z } from 'zod';

import {
  userDashboardStatsSchema,
  type UserDashboardStats
} from '@wordflow/shared/types';

export const dashboardSyncInputSchema = z.object({
  userId: z.string().min(1),
  pointsDelta: z.number().int().min(0),
  leaderboardDelta: z.number().int().min(0),
  updatedAt: z.string().datetime()
});

export type DashboardSyncInput = z.infer<typeof dashboardSyncInputSchema>;

export type DashboardStatsRepository = {
  findByUserId(userId: string): Promise<UserDashboardStats | null>;
  save(stats: UserDashboardStats): Promise<UserDashboardStats>;
};

export type DashboardStatsDocumentStore = {
  get(userId: string): Promise<UserDashboardStats | null>;
  set(stats: UserDashboardStats): Promise<void>;
};

export function createDefaultDashboardStats(
  userId: string,
  updatedAt: string
): UserDashboardStats {
  return userDashboardStatsSchema.parse({
    userId,
    totalPoints: 0,
    leaderboardScore: 0,
    updatedAt
  });
}

export async function syncDashboardStats(
  input: DashboardSyncInput,
  repository: DashboardStatsRepository
): Promise<UserDashboardStats> {
  const validatedInput = dashboardSyncInputSchema.parse(input);
  const current =
    (await repository.findByUserId(validatedInput.userId)) ??
    createDefaultDashboardStats(
      validatedInput.userId,
      validatedInput.updatedAt
    );

  const nextStats = userDashboardStatsSchema.parse({
    ...current,
    totalPoints: current.totalPoints + validatedInput.pointsDelta,
    leaderboardScore:
      current.leaderboardScore + validatedInput.leaderboardDelta,
    updatedAt: validatedInput.updatedAt
  });

  return repository.save(nextStats);
}

export class InMemoryDashboardStatsRepository implements DashboardStatsRepository {
  private readonly store = new Map<string, UserDashboardStats>();

  async findByUserId(userId: string): Promise<UserDashboardStats | null> {
    return this.store.get(userId) ?? null;
  }

  async save(stats: UserDashboardStats): Promise<UserDashboardStats> {
    this.store.set(stats.userId, stats);
    return stats;
  }
}

export class FirestoreDashboardStatsRepository implements DashboardStatsRepository {
  constructor(private readonly store: DashboardStatsDocumentStore) {}

  async findByUserId(userId: string): Promise<UserDashboardStats | null> {
    return this.store.get(userId);
  }

  async save(stats: UserDashboardStats): Promise<UserDashboardStats> {
    await this.store.set(stats);
    return stats;
  }
}
