import { describe, expect, it } from 'vitest';

import {
  shouldCreateStudyComebackPost,
  shouldCreateStudyMilestonePost
} from '../../apps/web/src/lib/feedEvents';

describe('feed event helpers', () => {
  it('detects comeback events after several days away', () => {
    expect(
      shouldCreateStudyComebackPost({
        previousSummary: {
          userId: 'user-1',
          currentStreak: 2,
          lastLearnedOn: '2026-03-20T00:00:00.000Z',
          todayCompleted: 3,
          studyMinutesToday: 10,
          dailyGoalTarget: 10,
          updatedAt: '2026-03-20T00:00:00.000Z'
        },
        learnedAt: '2026-03-28T00:00:00.000Z'
      })
    ).toBe(8);
  });

  it('detects milestone events when the daily threshold is crossed', () => {
    expect(
      shouldCreateStudyMilestonePost({
        previousSummary: {
          userId: 'user-1',
          currentStreak: 2,
          lastLearnedOn: '2026-03-28T00:00:00.000Z',
          todayCompleted: 7,
          studyMinutesToday: 12,
          dailyGoalTarget: 8,
          updatedAt: '2026-03-28T00:00:00.000Z'
        },
        nextSummary: {
          userId: 'user-1',
          currentStreak: 2,
          lastLearnedOn: '2026-03-28T00:00:00.000Z',
          todayCompleted: 10,
          studyMinutesToday: 18,
          dailyGoalTarget: 8,
          updatedAt: '2026-03-28T00:00:00.000Z'
        }
      })
    ).toBe(true);
  });
});
