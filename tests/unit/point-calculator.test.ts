import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateLearningPoints,
  applyDailyPointCaps,
  dedupeLearningReward,
} from '../../packages/shared/src/point';
import type { AppEnv } from '../../packages/shared/src/env';
import { parseEnv } from '../../packages/shared/src/env';

describe('Point Calculator Engine', () => {
  let env: AppEnv;

  beforeEach(() => {
    env = parseEnv({
      NODE_ENV: 'test',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'test',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test',
      FIREBASE_CLIENT_EMAIL: 'test@example.com',
      FIREBASE_PRIVATE_KEY: 'test',
      OPENAI_API_KEY: 'test',
      POLAR_ACCESS_TOKEN: 'test',
      POLAR_WEBHOOK_SECRET: 'test',
    });
  });

  it('should grant points for learning 15 minutes', () => {
    const points = calculateLearningPoints(env, { studyDurationMinutes: 15 });
    // 1 chunk of 15 minutes = 500 points (using defaults)
    expect(points).toBe(500);
  });

  it('should NOT grant bonus points for learning under 15 minutes', () => {
    const points = calculateLearningPoints(env, { studyDurationMinutes: 14 });
    expect(points).toBe(0);
  });

  it('should grant multiplied points for 30 minutes', () => {
    const points = calculateLearningPoints(env, { studyDurationMinutes: 30 });
    expect(points).toBe(1000); // 2 chunks * 500
  });

  it('should accurately sum various learning activities', () => {
    const points = calculateLearningPoints(env, {
      isFirstStudyOfDay: true, // 100
      studyDurationMinutes: 16, // 500
      wordsMemorized: 5, // 5 * 10 = 50
      reviewsCompleted: 1, // 1 * 200 = 200
      sentencesPracticed: 2, // 2 * 50 = 100
      gptConversations: 1, // 1 * 300 = 300
    });
    // Total: 100 + 500 + 50 + 200 + 100 + 300 = 1250
    expect(points).toBe(1250);
  });
});

describe('Point Cap & Dedupe Safeguards', () => {
  it('should apply daily point caps correctly', () => {
    // Under cap
    expect(applyDailyPointCaps(1000, 500, 5000)).toBe(500);
    // At cap boundary
    expect(applyDailyPointCaps(4800, 500, 5000)).toBe(200);
    // Already exceeded cap
    expect(applyDailyPointCaps(6000, 500, 5000)).toBe(0);
  });

  it('should prevent duplicate rewards by event ID', () => {
    const history = ['event-1', 'event-2'];
    expect(dedupeLearningReward(history, 'event-3')).toBe(true); // new event -> allowed
    expect(dedupeLearningReward(history, 'event-1')).toBe(false); // duplicate -> blocked
  });
});
