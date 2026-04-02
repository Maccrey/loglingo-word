import { describe, it, expect } from 'vitest';
import { performCatCareAction } from '../../packages/shared/src/cat/actions';
import { calculateCatStatus } from '../../packages/shared/src/cat/engine';
import type { Cat } from '../../packages/shared/src/cat/types';

describe('Cat Care Actions Service', () => {
  const mockEnv = {
    CAT_COST_FEED: 100,
    CAT_COST_WASH: 150,
    CAT_COST_PLAY: 200,
    CAT_COST_HEAL: 1000,
    CAT_HUNGRY_HOURS: 12,
    CAT_SICK_HOURS: 48,
    CAT_CRITICAL_HOURS: 24,
    CAT_DEAD_DAYS: 3,
  };

  const MS_PER_HOUR = 60 * 60 * 1000;

  function createMockCat(hoursSinceFed: number, hoursSinceWashed: number, hoursSincePlayed: number): Cat {
    const now = Date.now();
    return {
      id: 'cat-1',
      userId: 'user-1',
      name: 'Test',
      stage: 'kitten',
      status: 'healthy',
      createdAt: now,
      updatedAt: now,
      lastFedAt: now - hoursSinceFed * MS_PER_HOUR,
      lastWashedAt: now - hoursSinceWashed * MS_PER_HOUR,
      lastPlayedAt: now - hoursSincePlayed * MS_PER_HOUR,
      activeDays: 0,
    };
  }

  it('T3-1: should feed cat and deduct points', () => {
    const cat = createMockCat(15, 0, 0); // Hungry
    const now = Date.now();
    const result = performCatCareAction(cat, 'feed', 500, now, mockEnv);

    expect(result.success).toBe(true);
    expect(result.cost).toBe(100);
    expect(result.newCat.lastFedAt).toBe(now);
    expect(result.newCat.dailyCareCompletion?.feed).toBeDefined();
  });

  it('T3-1: should fail to feed if not enough points', () => {
    const cat = createMockCat(15, 0, 0); // Hungry
    const result = performCatCareAction(cat, 'feed', 50, Date.now(), mockEnv);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Not enough points/);
  });

  it('T3-4 & T3-5: should heal sick cat using medicine and heal critical cat using injection', () => {
    // Sick cat = neglected for 12 + 48 = 60 hours
    const sickCat = createMockCat(61, 61, 61);
    const now = Date.now();
    const healSickResult = performCatCareAction(sickCat, 'heal', 2000, now, mockEnv);

    expect(healSickResult.success).toBe(true);
    expect(healSickResult.newCat.lastFedAt).toBe(now);
    expect(healSickResult.newCat.dailyCareCompletion).toBeUndefined();

    // Critical cat = neglected for 12 + 48 + 24 = 84 hours
    const criticalCat = createMockCat(85, 85, 85);
    const healCriticalResult = performCatCareAction(criticalCat, 'heal', 2000, now, mockEnv);

    expect(healCriticalResult.success).toBe(true);
    expect(healCriticalResult.newCat.lastFedAt).toBe(now);
    expect(healCriticalResult.newCat.dailyCareCompletion).toBeUndefined();
  });

  it('T3-6: should block heal if cat is not sick or critical', () => {
    const defaultCat = createMockCat(0, 0, 0);
    const result = performCatCareAction(defaultCat, 'heal', 5000, Date.now(), mockEnv);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not sick or critical/);
  });

  it('T3-6: should reject action if cat is dead', () => {
    const deadCat = createMockCat(160, 160, 160); // Past 156 hours
    const result = performCatCareAction(deadCat, 'feed', 5000, Date.now(), mockEnv);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/passed away/);
  });
});
