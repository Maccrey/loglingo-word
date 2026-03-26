import { describe, expect, it } from 'vitest';

import { getFallbackRecommendations } from '../../services/ai/src/recommendation';

describe('db recommendation fallback', () => {
  it('prioritizes weaker words from progress data', () => {
    const result = getFallbackRecommendations({
      progress: [
        {
          wordId: 'hello',
          correctStreak: 4,
          storageStrength: 1.8,
          retrievalStrength: 1.7
        },
        {
          wordId: 'passport',
          correctStreak: 1,
          storageStrength: 0.5,
          retrievalStrength: 0.4
        },
        {
          wordId: 'subway',
          correctStreak: 2,
          storageStrength: 1,
          retrievalStrength: 0.9
        }
      ],
      curriculumWordIds: ['hello', 'passport', 'subway'],
      limit: 2
    });

    expect(result).toEqual(['passport', 'subway']);
  });

  it('falls back to curriculum words when progress data is insufficient', () => {
    const result = getFallbackRecommendations({
      progress: [
        {
          wordId: 'passport',
          correctStreak: 1,
          storageStrength: 0.5,
          retrievalStrength: 0.4
        }
      ],
      curriculumWordIds: ['hello', 'passport', 'subway', 'reservation'],
      limit: 3
    });

    expect(result).toEqual(['passport', 'hello', 'subway']);
  });
});
