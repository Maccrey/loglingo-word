import { describe, expect, it } from 'vitest';

import { calculateTimedLearningRewardPoints } from '../../apps/web/src/lib/useTimedLearningReward';

describe('timed learning rewards', () => {
  it('awards the first time milestone at 15 minutes', () => {
    expect(calculateTimedLearningRewardPoints(1)).toBe(500);
  });

  it('adds incremental 5-minute rewards after the first milestone', () => {
    expect(calculateTimedLearningRewardPoints(2)).toBe(667);
    expect(calculateTimedLearningRewardPoints(3)).toBe(834);
  });
});
