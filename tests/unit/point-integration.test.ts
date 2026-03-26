import { describe, it, expect } from 'vitest';
import { processLearningEventToCatPoints } from '../../services/core/src/point-integration';
import { type AppEnv } from '../../packages/shared/src/env';

describe('Study Point Integration Module', () => {
  const mockEnv: AppEnv = {
    NODE_ENV: 'test',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
    FIREBASE_CLIENT_EMAIL: 'test@example.com',
    FIREBASE_PRIVATE_KEY: 'test',
    OPENAI_API_KEY: 'test',
    POLAR_ACCESS_TOKEN: 'test',
    POLAR_WEBHOOK_SECRET: 'test',
    POINTS_LEARNING_BASE: 500,
    POINTS_WORDS: 10,
    POINTS_REVIEW: 200,
    POINTS_SENTENCES: 50,
    POINTS_GPT_CONVERSATION: 300,
    
    // Core cat thresholds required by AppEnv
    CAT_COST_FEED: 100,
    CAT_COST_WASH: 150,
    CAT_COST_PLAY: 200,
    CAT_COST_HEAL: 1000,
    CAT_HUNGRY_HOURS: 12,
    CAT_SMELLY_HOURS: 24,
    CAT_STRESSED_HOURS: 24,
    CAT_SICK_HOURS: 48,
    CAT_CRITICAL_HOURS: 24,
    CAT_DEAD_DAYS: 3,
    CAT_STAGE_JUNIOR_DAYS: 30,
    CAT_STAGE_ADULT_DAYS: 90,
    CAT_STAGE_MIDDLE_AGE_DAYS: 150,
    CAT_STAGE_SENIOR_DAYS: 210,
    CAT_STAGE_VETERAN_DAYS: 280,
    CAT_STAGE_LEGACY_DAYS: 365,
  };

  it('should grant points for a valid new learning event', () => {
    const result = processLearningEventToCatPoints(
      'user-1',
      'lesson-123',
      { studyDurationMinutes: 15, wordsMemorized: 5 }, // 500 + 50 = 550
      mockEnv,
      ['old-lesson'],
      0,
      5000
    );

    expect(result.success).toBe(true);
    expect(result.grantedPoints).toBe(550);
    expect(result.entry?.userId).toBe('user-1');
    expect(result.entry?.amount).toBe(550);
    expect(result.entry?.reason).toBe('learning_reward');
  });

  it('should block duplicate events', () => {
    const result = processLearningEventToCatPoints(
      'user-1',
      'lesson-123',
      { studyDurationMinutes: 15 },
      mockEnv,
      ['lesson-123'] // already present
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe('duplicate_event');
  });

  it('should return no points if activity yields 0', () => {
    const result = processLearningEventToCatPoints(
      'user-1',
      'lesson-124',
      { studyDurationMinutes: 5 }, // under 15 min, 0 words
      mockEnv,
      []
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe('no_points_earned');
  });

  it('should enforce daily caps', () => {
    // Already earned 4800, max is 5000. Try to earn 500.
    const result = processLearningEventToCatPoints(
      'user-1',
      'lesson-125',
      { studyDurationMinutes: 15 }, // 500 points
      mockEnv,
      [],
      4800,
      5000
    );

    expect(result.success).toBe(true);
    // Should cap out at 200
    expect(result.grantedPoints).toBe(200);
    expect(result.entry?.amount).toBe(200);
  });
});
