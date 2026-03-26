export type RewardEventType =
  | 'lesson_complete'
  | 'correct_streak'
  | 'share'
  | 'quest_complete';

export type RewardEvent = {
  type: RewardEventType;
  awardId: string;
  value?: number;
};

export type RewardLedger = {
  awardedIds: string[];
  totalPoints: number;
};

export type RewardCalculation = {
  points: number;
  applied: RewardEvent[];
  skipped: RewardEvent[];
  ledger: RewardLedger;
};

export type StreakState = {
  currentStreak: number;
  lastLearnedOn?: string;
};

export type DailyGoal = {
  target: number;
  completed: number;
  progressPercent: number;
  isComplete: boolean;
};

export type LevelProgress = {
  level: number;
  currentPoints: number;
  currentLevelBasePoints: number;
  nextLevelPoints: number;
  pointsIntoLevel: number;
  pointsToNextLevel: number;
  progressPercent: number;
};

export type ShareQuestRewardResult = RewardCalculation & {
  awardId: string;
};

const rewardTable: Record<RewardEventType, number> = {
  lesson_complete: 10,
  correct_streak: 5,
  share: 8,
  quest_complete: 20
};

function toDateOnly(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function getDayDiff(previousDay: string, nextDay: string): number {
  const previous = new Date(`${previousDay}T00:00:00.000Z`).getTime();
  const next = new Date(`${nextDay}T00:00:00.000Z`).getTime();

  return Math.round((next - previous) / (1000 * 60 * 60 * 24));
}

export function getRewardPoints(event: RewardEvent): number {
  const basePoints = rewardTable[event.type];

  if (event.type === 'correct_streak') {
    return basePoints * Math.max(1, event.value ?? 1);
  }

  return event.value ?? basePoints;
}

export function calculateRewardPoints(
  events: RewardEvent[],
  ledger: RewardLedger = { awardedIds: [], totalPoints: 0 }
): RewardCalculation {
  const awardedIds = new Set(ledger.awardedIds);
  const applied: RewardEvent[] = [];
  const skipped: RewardEvent[] = [];
  let points = 0;

  for (const event of events) {
    if (awardedIds.has(event.awardId)) {
      skipped.push(event);
      continue;
    }

    points += getRewardPoints(event);
    awardedIds.add(event.awardId);
    applied.push(event);
  }

  return {
    points,
    applied,
    skipped,
    ledger: {
      awardedIds: [...awardedIds],
      totalPoints: ledger.totalPoints + points
    }
  };
}

export function applyShareQuestReward(
  postId: string,
  ledger: RewardLedger = { awardedIds: [], totalPoints: 0 }
): ShareQuestRewardResult {
  const awardId = `share:${postId}`;
  const result = calculateRewardPoints(
    [
      {
        type: 'share',
        awardId
      }
    ],
    ledger
  );

  return {
    ...result,
    awardId
  };
}

export function updateLearningStreak(
  state: StreakState,
  learnedAt: string
): StreakState {
  const learnedDay = toDateOnly(learnedAt);

  if (!state.lastLearnedOn) {
    return {
      currentStreak: 1,
      lastLearnedOn: learnedDay
    };
  }

  const dayDiff = getDayDiff(state.lastLearnedOn, learnedDay);

  if (dayDiff <= 0) {
    return {
      ...state,
      lastLearnedOn: learnedDay
    };
  }

  if (dayDiff === 1) {
    return {
      currentStreak: state.currentStreak + 1,
      lastLearnedOn: learnedDay
    };
  }

  return {
    currentStreak: 1,
    lastLearnedOn: learnedDay
  };
}

export function calculateDailyGoal(completed: number, target = 10): DailyGoal {
  const safeTarget = Math.max(1, target);
  const safeCompleted = Math.max(0, completed);
  const progressPercent = Math.min(
    100,
    Math.round((safeCompleted / safeTarget) * 100)
  );

  return {
    target: safeTarget,
    completed: safeCompleted,
    progressPercent,
    isComplete: safeCompleted >= safeTarget
  };
}

export function getLevelBasePoints(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return 50 * safeLevel * (safeLevel - 1);
}

export function calculateLevelProgress(points: number): LevelProgress {
  const safePoints = Math.max(0, Math.floor(points));
  let level = 1;

  while (safePoints >= getLevelBasePoints(level + 1)) {
    level += 1;
  }

  const currentLevelBasePoints = getLevelBasePoints(level);
  const nextLevelPoints = getLevelBasePoints(level + 1);
  const pointsIntoLevel = safePoints - currentLevelBasePoints;
  const pointsToNextLevel = nextLevelPoints - safePoints;
  const levelSpan = nextLevelPoints - currentLevelBasePoints;
  const progressPercent = Math.round((pointsIntoLevel / levelSpan) * 100);

  return {
    level,
    currentPoints: safePoints,
    currentLevelBasePoints,
    nextLevelPoints,
    pointsIntoLevel,
    pointsToNextLevel,
    progressPercent
  };
}
