import { describe, it, expect } from 'vitest';
import {
  calculateGrowthDays,
  canGrantExtraKitten,
  validateMultiCatSlots,
  selectActiveCat,
} from '../../packages/shared/src/cat/growth';
import type { Cat } from '../../packages/shared/src/cat/types';

describe('Cat Growth and Rewards Module', () => {
  const mockEnv = {
    CAT_HUNGRY_HOURS: 12,
    CAT_SICK_HOURS: 48,
    CAT_STAGE_LEGACY_DAYS: 365,
  };

  const MS_PER_HOUR = 60 * 60 * 1000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  function createMockCat(
    activeDays: number,
    hoursSinceInteraction: number,
    hoursSinceUpdate: number
  ): Cat {
    const now = Date.now();
    return {
      id: 'cat-1',
      userId: 'user-1',
      name: 'Test',
      stage: 'kitten',
      status: 'healthy',
      createdAt: now - activeDays * MS_PER_DAY,
      updatedAt: now - hoursSinceUpdate * MS_PER_HOUR,
      lastFedAt: now - hoursSinceInteraction * MS_PER_HOUR,
      lastWashedAt: now - hoursSinceInteraction * MS_PER_HOUR,
      lastPlayedAt: now - hoursSinceInteraction * MS_PER_HOUR,
      activeDays,
    };
  }

  describe('T4-1: Growth Days Calculation', () => {
    it('should accumulate active days when cat is healthy', () => {
      // Healthy cat that hasn't been updated for 24 hours (1 day)
      const cat = createMockCat(10, 5, 24);
      const result = calculateGrowthDays(cat, Date.now(), mockEnv);

      // Active days should increase by 1
      expect(result.activeDays).toBe(11);
      expect(result.updatedAt).toBeGreaterThan(cat.updatedAt);
    });

    it('should NOT accumulate active days when cat is sick', () => {
      // Sick cat (neglected for 61 hours), hasn't been updated for 24 hours
      const cat = createMockCat(10, 61, 24);
      const result = calculateGrowthDays(cat, Date.now(), mockEnv);

      // Active days should not increase
      expect(result.activeDays).toBe(10);
      expect(result.updatedAt).toBeGreaterThan(cat.updatedAt);
    });
  });

  describe('T4-3: Extra Kitten Rewards', () => {
    it('should allow extra kitten if cat reached legacy stage (365 days)', () => {
      const cat = createMockCat(365, 0, 0);
      expect(canGrantExtraKitten(cat, mockEnv)).toBe(true);
    });

    it('should block extra kitten if cat has not reached legacy stage', () => {
      const cat = createMockCat(200, 0, 0); // Only Senior
      expect(canGrantExtraKitten(cat, mockEnv)).toBe(false);
    });
  });

  describe('T4-4: Multi-cat Slot Rules', () => {
    it('should validate max slots', () => {
      const catList: Cat[] = [createMockCat(1, 0, 0)];
      // Should allow adding if below max (default 2)
      expect(validateMultiCatSlots(catList, 2)).toBe(true);

      catList.push(createMockCat(2, 0, 0));
      // Should deny adding if at max (2)
      expect(validateMultiCatSlots(catList, 2)).toBe(false);
    });

    it('should select active cat by ID', () => {
      const cat1 = createMockCat(1, 0, 0);
      cat1.id = 'target-cat';
      const cat2 = createMockCat(2, 0, 0);
      cat2.id = 'other-cat';
      
      const selected = selectActiveCat([cat1, cat2], 'target-cat');
      expect(selected).toBeDefined();
      expect(selected?.id).toBe('target-cat');
    });
  });
});
