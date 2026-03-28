import type { UserHomeSummary } from '@wordflow/shared/types';

export function calculateDaysAway(previousLearnedOn: string, learnedAt: string) {
  const previous = new Date(previousLearnedOn);
  const current = new Date(learnedAt);
  const diff = current.getTime() - previous.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function shouldCreateStudyComebackPost(input: {
  previousSummary: UserHomeSummary | null;
  learnedAt: string;
  minimumDaysAway?: number;
}) {
  if (!input.previousSummary?.lastLearnedOn) {
    return null;
  }

  const daysAway = calculateDaysAway(
    input.previousSummary.lastLearnedOn,
    input.learnedAt
  );
  const minimumDaysAway = input.minimumDaysAway ?? 3;

  return daysAway >= minimumDaysAway ? daysAway : null;
}

export function shouldCreateStudyMilestonePost(input: {
  previousSummary: UserHomeSummary | null;
  nextSummary: UserHomeSummary;
}) {
  const threshold = Math.max(input.nextSummary.dailyGoalTarget, 10);
  const previousCompleted = input.previousSummary?.todayCompleted ?? 0;

  return previousCompleted < threshold && input.nextSummary.todayCompleted >= threshold;
}
