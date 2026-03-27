import { describe, expect, it } from 'vitest';

import {
  calculateMasteredWordRatio,
  isWordMastered,
  upsertLearningProgress
} from '../../apps/web/src/lib/learningProgressStorage';

describe('learning progress storage helpers', () => {
  it('treats strong repeated recall as mastered', () => {
    expect(
      isWordMastered({
        wordId: 'hello',
        correctStreak: 2,
        storageStrength: 1.2,
        retrievalStrength: 0.9
      })
    ).toBe(true);
    expect(
      isWordMastered({
        wordId: 'passport',
        correctStreak: 1,
        storageStrength: 0.9,
        retrievalStrength: 0.8
      })
    ).toBe(false);
  });

  it('calculates the mastered ratio for a level word set', () => {
    expect(
      calculateMasteredWordRatio(
        ['hello', 'thanks', 'subway', 'breakfast'],
        [
          {
            wordId: 'hello',
            correctStreak: 2,
            storageStrength: 1.2,
            retrievalStrength: 1
          },
          {
            wordId: 'thanks',
            correctStreak: 2,
            storageStrength: 1.1,
            retrievalStrength: 0.8
          },
          {
            wordId: 'subway',
            correctStreak: 2,
            storageStrength: 1.3,
            retrievalStrength: 0.9
          }
        ]
      )
    ).toBe(0.75);
  });

  it('replaces existing progress when the same word is updated', () => {
    expect(
      upsertLearningProgress(
        [
          {
            wordId: 'hello',
            correctStreak: 1,
            storageStrength: 0.7,
            retrievalStrength: 0.6
          }
        ],
        [
          {
            wordId: 'hello',
            correctStreak: 2,
            storageStrength: 1.2,
            retrievalStrength: 1
          }
        ]
      )
    ).toEqual([
      {
        wordId: 'hello',
        correctStreak: 2,
        storageStrength: 1.2,
        retrievalStrength: 1
      }
    ]);
  });
});
