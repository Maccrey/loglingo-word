import { describe, it, expect } from 'vitest';
import { 
  buildCatStateSnapshot,
  calculateCatStatus, 
  calculateCatStage, 
  deriveCatHealthStatus,
  getStressState,
  isHungry, 
  isSmelly, 
  isStressed,
  shouldCatDie
} from '../../packages/shared/src/cat/engine';
import type { Cat } from '../../packages/shared/src/cat/types';

describe('Cat Status Transition Engine', () => {
  const mockEnv = {
    CAT_HUNGRY_HOURS: 12,
    CAT_SMELLY_HOURS: 24,
    CAT_STRESSED_HOURS: 24,
    CAT_SICK_HOURS: 48,
    CAT_CRITICAL_HOURS: 24,
    CAT_DEAD_DAYS: 3, // 72 hours
  };

  const MS_PER_HOUR = 60 * 60 * 1000;

  function createMockCat(hoursSinceFed: number, hoursSinceWashed: number, hoursSincePlayed: number): Cat {
    const now = Date.now();
    return {
      id: 'cat-1',
      userId: 'user-1',
      name: 'TestCat',
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

  describe('T2-1 to T2-3: Basic Status Functions', () => {
    it('should calculate hungry correctly', () => {
      const healthyCat = createMockCat(10, 0, 0); // Fed 10 hours ago
      expect(isHungry(healthyCat, Date.now(), mockEnv as any)).toBe(false);

      const hungryCat = createMockCat(13, 0, 0); // Fed 13 hours ago (threshold is 12)
      expect(isHungry(hungryCat, Date.now(), mockEnv as any)).toBe(true);
    });

    it('should calculate smelly correctly', () => {
      const smellyCat = createMockCat(0, 25, 0); // threshold is 24
      expect(isSmelly(smellyCat, Date.now(), mockEnv as any)).toBe(true);
    });

    it('should calculate stressed correctly', () => {
      const stressedCat = createMockCat(0, 0, 25); // threshold is 24
      expect(isStressed(stressedCat, Date.now(), mockEnv as any)).toBe(true);
    });

    it('should derive stress state boundaries from play neglect time', () => {
      const stressedCat = createMockCat(0, 0, 25);
      const sickStressCat = createMockCat(0, 0, 73);

      expect(getStressState(createMockCat(0, 0, 5), Date.now(), mockEnv as any)).toBe('healthy');
      expect(getStressState(stressedCat, Date.now(), mockEnv as any)).toBe('stressed');
      expect(getStressState(sickStressCat, Date.now(), mockEnv as any)).toBe('sick');
    });
  });

  describe('T2-4 & T2-5: Comprehensive Status Calculation', () => {
    it('should return healthy if all interactions are recent', () => {
      const cat = createMockCat(5, 5, 5);
      expect(calculateCatStatus(cat, Date.now(), mockEnv)).toBe('healthy');
    });

    it('should prioritize hungry > smelly > stressed', () => {
      // 25 hours passed for both feed, wash, play. 
      // Hungry threshold = 12, Smelly = 24, Stressed = 24. All violated.
      const cat = createMockCat(25, 25, 25);
      // Wait, 25 hours is NOT sick yet. Sick threshold is Hungry(12) + Sick(48) = 60 hours.
      expect(calculateCatStatus(cat, Date.now(), mockEnv)).toBe('hungry');
      
      // If we only violate smelly and stressed
      const cat2 = createMockCat(5, 25, 25);
      expect(calculateCatStatus(cat2, Date.now(), mockEnv)).toBe('smelly');
      
      // If only stressed violated
      const cat3 = createMockCat(5, 5, 25);
      expect(calculateCatStatus(cat3, Date.now(), mockEnv)).toBe('stressed');
    });

    it('should return sick when abandoned past sick threshold', () => {
      // Sick threshold = 12(hungry) + 48(sick) = 60 hours
      const cat = createMockCat(61, 61, 61);
      expect(calculateCatStatus(cat, Date.now(), mockEnv)).toBe('sick');
    });

    it('should return critical when abandoned past critical threshold', () => {
      // Critical threshold = 12(hungry) + 48(sick) + 24(critical) = 84 hours
      const cat = createMockCat(85, 85, 85);
      expect(calculateCatStatus(cat, Date.now(), mockEnv)).toBe('critical');
    });

    it('should return dead when abandoned past dead threshold', () => {
      // Dead threshold = 12(hungry) + 48(sick) + 24(critical) + 72(dead_days) = 156 hours
      const cat = createMockCat(157, 157, 157);
      expect(calculateCatStatus(cat, Date.now(), mockEnv)).toBe('dead');
    });
    
    it('should base severity on the MOST neglected metric (min of last interaction)', () => {
      // Feed is ok (10h), wash is ok (10h), play is ignored for 65h
      // Max neglect = 65h, which > Sick Threshold (60h). It should be SICK.
      const cat = createMockCat(10, 10, 65);
      expect(calculateCatStatus(cat, Date.now(), mockEnv)).toBe('sick');
    });

    it('should derive the same priority order through the helper', () => {
      expect(
        deriveCatHealthStatus({
          severityStatus: 'healthy',
          isHungry: true,
          isSmelly: true,
          stressStatus: 'stressed'
        })
      ).toBe('hungry');

      expect(
        deriveCatHealthStatus({
          severityStatus: 'healthy',
          isHungry: false,
          isSmelly: true,
          stressStatus: 'stressed'
        })
      ).toBe('smelly');

      expect(
        deriveCatHealthStatus({
          severityStatus: 'healthy',
          isHungry: false,
          isSmelly: false,
          stressStatus: 'stressed'
        })
      ).toBe('stressed');
    });

    it('should expose a consistent cat state snapshot', () => {
      const cat = createMockCat(13, 25, 25);
      const snapshot = buildCatStateSnapshot(cat, Date.now(), mockEnv);

      expect(snapshot.status).toBe('hungry');
      expect(snapshot.stage).toBe('kitten');
      expect(snapshot.isHungry).toBe(true);
      expect(snapshot.isSmelly).toBe(true);
      expect(snapshot.isStressed).toBe(true);
      expect(snapshot.shouldDie).toBe(false);
    });

    it('should detect fatal neglect through shouldCatDie', () => {
      expect(shouldCatDie(createMockCat(157, 157, 157), Date.now(), mockEnv)).toBe(true);
      expect(shouldCatDie(createMockCat(10, 10, 10), Date.now(), mockEnv)).toBe(false);
    });
  });

  describe('Growth Stage Calculation', () => {
    it('should return correct stages based on active days', () => {
      expect(calculateCatStage(0, mockEnv)).toBe('kitten');
      expect(calculateCatStage(30, mockEnv)).toBe('junior');
      expect(calculateCatStage(95, mockEnv)).toBe('adult');
      expect(calculateCatStage(150, mockEnv)).toBe('middleAge');
      expect(calculateCatStage(210, mockEnv)).toBe('senior');
      expect(calculateCatStage(280, mockEnv)).toBe('veteran');
      expect(calculateCatStage(365, mockEnv)).toBe('legacy');
    });
  });
});
