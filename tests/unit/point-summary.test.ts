import { describe, it, expect } from 'vitest';
import {
  summarizeStudyToCareOutcome,
  isDailyStudyEnoughForCatCare
} from '../../packages/shared/src/point/summary';

describe('Point to Care Summary Module', () => {
  const mockEnv = {
    CAT_COST_FEED: 100,
    CAT_COST_PLAY: 200,
    CAT_COST_WASH: 150,
  };

  describe('T5-1: summarizeStudyToCareOutcome', () => {
    it('should convert points to max possible action counts independently', () => {
      // With 500 points:
      // feed: 500 / 100 = 5
      // play: 500 / 200 = 2.5 -> 2
      // wash: 500 / 150 = 3.33 -> 3
      const summary = summarizeStudyToCareOutcome(500, mockEnv);
      expect(summary.feedCount).toBe(5);
      expect(summary.playCount).toBe(2);
      expect(summary.washCount).toBe(3);
      expect(summary.remainingPoints).toBe(500);
    });

    it('should return 0 counts when points are insufficient', () => {
      const summary = summarizeStudyToCareOutcome(50, mockEnv);
      expect(summary.feedCount).toBe(0);
      expect(summary.playCount).toBe(0);
      expect(summary.washCount).toBe(0);
      expect(summary.remainingPoints).toBe(50);
    });
  });

  describe('T5-2: isDailyStudyEnoughForCatCare', () => {
    it('should return true if daily points meet or exceed minimum safety threshold (feed+play)', () => {
      // Safe target = 100 + 200 = 300
      expect(isDailyStudyEnoughForCatCare(300, mockEnv)).toBe(true);
      expect(isDailyStudyEnoughForCatCare(500, mockEnv)).toBe(true);
    });

    it('should return false if daily points are below threshold', () => {
      expect(isDailyStudyEnoughForCatCare(200, mockEnv)).toBe(false);
      expect(isDailyStudyEnoughForCatCare(50, mockEnv)).toBe(false);
    });
  });
});
