export type LeaderboardEntryRecord = {
  weekId: string;
  userId: string;
  score: number;
  rank: number;
};

export type LeaderboardUpdateInput = {
  entries: LeaderboardEntryRecord[];
  weekId: string;
  userId: string;
  scoreDelta: number;
};

export type LeaderboardUpdateResult = {
  entries: LeaderboardEntryRecord[];
  updatedEntry: LeaderboardEntryRecord;
  myRank: number;
};

export type LeaderboardDocumentStore = {
  getByWeekId: (weekId: string) => Promise<LeaderboardEntryRecord[]>;
  setByWeekId: (
    weekId: string,
    entries: LeaderboardEntryRecord[]
  ) => Promise<void>;
};

export type LeaderboardRepository = {
  listByWeekId: (weekId: string) => Promise<LeaderboardEntryRecord[]>;
  saveByWeekId: (
    weekId: string,
    entries: LeaderboardEntryRecord[]
  ) => Promise<LeaderboardEntryRecord[]>;
};

function sortLeaderboard(
  entries: LeaderboardEntryRecord[]
): LeaderboardEntryRecord[] {
  return [...entries].sort((left, right) => {
    if (left.score === right.score) {
      return left.userId.localeCompare(right.userId);
    }

    return right.score - left.score;
  });
}

function normalizeEntry(entry: LeaderboardEntryRecord): LeaderboardEntryRecord {
  return {
    weekId: entry.weekId,
    userId: entry.userId,
    score: Math.max(0, Math.floor(entry.score)),
    rank: Math.max(1, Math.floor(entry.rank))
  };
}

function assignRanks(
  entries: LeaderboardEntryRecord[]
): LeaderboardEntryRecord[] {
  return sortLeaderboard(entries).map((entry, index) =>
    normalizeEntry({
      ...entry,
      rank: index + 1
    })
  );
}

export function upsertLeaderboardScore(
  input: LeaderboardUpdateInput
): LeaderboardUpdateResult {
  const scoreDelta = Math.max(0, Math.floor(input.scoreDelta));
  const currentEntries = input.entries.map((entry) => normalizeEntry(entry));
  const existingEntry = currentEntries.find(
    (entry) => entry.weekId === input.weekId && entry.userId === input.userId
  );

  const nextEntries = existingEntry
    ? currentEntries.map((entry) =>
        entry.weekId === input.weekId && entry.userId === input.userId
          ? {
              ...entry,
              score: entry.score + scoreDelta
            }
          : entry
      )
    : [
        ...currentEntries,
        {
          weekId: input.weekId,
          userId: input.userId,
          score: scoreDelta,
          rank: currentEntries.length + 1
        }
      ];

  const rankedEntries = assignRanks(nextEntries);
  const updatedEntry = rankedEntries.find(
    (entry) => entry.weekId === input.weekId && entry.userId === input.userId
  );

  if (!updatedEntry) {
    throw new Error('Updated leaderboard entry not found.');
  }

  return {
    entries: rankedEntries,
    updatedEntry,
    myRank: updatedEntry.rank
  };
}

export class InMemoryLeaderboardRepository implements LeaderboardRepository {
  private readonly records = new Map<string, LeaderboardEntryRecord[]>();

  async listByWeekId(weekId: string): Promise<LeaderboardEntryRecord[]> {
    return (this.records.get(weekId) ?? []).map((entry) =>
      normalizeEntry(entry)
    );
  }

  async saveByWeekId(
    weekId: string,
    entries: LeaderboardEntryRecord[]
  ): Promise<LeaderboardEntryRecord[]> {
    const normalizedEntries = assignRanks(
      entries
        .filter((entry) => entry.weekId === weekId)
        .map((entry) => normalizeEntry(entry))
    );

    this.records.set(weekId, normalizedEntries);

    return normalizedEntries;
  }
}

export class FirestoreLeaderboardRepository implements LeaderboardRepository {
  constructor(private readonly store: LeaderboardDocumentStore) {}

  async listByWeekId(weekId: string): Promise<LeaderboardEntryRecord[]> {
    return (await this.store.getByWeekId(weekId)).map((entry) =>
      normalizeEntry(entry)
    );
  }

  async saveByWeekId(
    weekId: string,
    entries: LeaderboardEntryRecord[]
  ): Promise<LeaderboardEntryRecord[]> {
    const normalizedEntries = assignRanks(
      entries
        .filter((entry) => entry.weekId === weekId)
        .map((entry) => normalizeEntry(entry))
    );

    await this.store.setByWeekId(weekId, normalizedEntries);

    return normalizedEntries;
  }
}
