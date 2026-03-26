import { describe, expect, it } from 'vitest';

import {
  applyShareQuestReward,
  calculateDailyGoal,
  calculateLevelProgress,
  calculateRewardPoints,
  getRewardPoints,
  updateLearningStreak
} from '../../services/core/src/gamification';

describe('reward point rules', () => {
  it('awards points for a completed lesson', () => {
    const result = calculateRewardPoints([
      {
        type: 'lesson_complete',
        awardId: 'lesson-2026-03-25'
      }
    ]);

    expect(result.points).toBe(10);
    expect(result.ledger.totalPoints).toBe(10);
    expect(result.applied).toHaveLength(1);
  });

  it('skips duplicate awards that were already granted', () => {
    const result = calculateRewardPoints(
      [
        {
          type: 'lesson_complete',
          awardId: 'lesson-2026-03-25'
        },
        {
          type: 'lesson_complete',
          awardId: 'lesson-2026-03-25'
        }
      ],
      {
        awardedIds: ['share-2026-03-25'],
        totalPoints: 8
      }
    );

    expect(result.points).toBe(10);
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.ledger.totalPoints).toBe(18);
  });

  it('scales streak rewards by the streak value', () => {
    expect(
      getRewardPoints({
        type: 'correct_streak',
        awardId: 'streak-3',
        value: 3
      })
    ).toBe(15);
  });

  it('awards share quest points once per post', () => {
    const firstShare = applyShareQuestReward('post-1');
    const secondShare = applyShareQuestReward('post-1', firstShare.ledger);

    expect(firstShare.points).toBe(8);
    expect(secondShare.points).toBe(0);
    expect(secondShare.skipped).toHaveLength(1);
  });
});

describe('learning streak', () => {
  it('increments the streak on consecutive days', () => {
    const dayOne = updateLearningStreak(
      { currentStreak: 0 },
      '2026-03-25T08:00:00.000Z'
    );
    const dayTwo = updateLearningStreak(dayOne, '2026-03-26T07:00:00.000Z');

    expect(dayOne.currentStreak).toBe(1);
    expect(dayTwo.currentStreak).toBe(2);
    expect(dayTwo.lastLearnedOn).toBe('2026-03-26');
  });

  it('resets the streak after skipping a day', () => {
    const result = updateLearningStreak(
      {
        currentStreak: 4,
        lastLearnedOn: '2026-03-25'
      },
      '2026-03-27T12:00:00.000Z'
    );

    expect(result.currentStreak).toBe(1);
    expect(result.lastLearnedOn).toBe('2026-03-27');
  });
});

describe('daily goal', () => {
  it('calculates progress percent from the current completion count', () => {
    const goal = calculateDailyGoal(4, 8);

    expect(goal.progressPercent).toBe(50);
    expect(goal.isComplete).toBe(false);
  });

  it('marks the goal complete when the target is reached', () => {
    const goal = calculateDailyGoal(12, 10);

    expect(goal.progressPercent).toBe(100);
    expect(goal.isComplete).toBe(true);
  });
});

describe('level progress', () => {
  it('levels up at the configured point thresholds', () => {
    const levelOne = calculateLevelProgress(99);
    const levelTwo = calculateLevelProgress(100);
    const levelThree = calculateLevelProgress(300);

    expect(levelOne.level).toBe(1);
    expect(levelTwo.level).toBe(2);
    expect(levelThree.level).toBe(3);
  });

  it('calculates remaining points to the next level', () => {
    const progress = calculateLevelProgress(135);

    expect(progress.level).toBe(2);
    expect(progress.pointsIntoLevel).toBe(35);
    expect(progress.pointsToNextLevel).toBe(165);
    expect(progress.progressPercent).toBe(18);
  });
});
