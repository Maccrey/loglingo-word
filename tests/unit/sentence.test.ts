import { describe, expect, it } from 'vitest';

import {
  buildSentenceExercise,
  buildSentenceTokens,
  compareSentenceAnswer
} from '../../services/core/src/sentence';

describe('sentence builder rules', () => {
  it('builds drag-and-drop tokens from the example sentence', () => {
    const exercise = buildSentenceExercise({
      wordId: 'passport'
    });

    expect(exercise.tokens.map((token) => token.value)).toEqual([
      'Please',
      'show',
      'me',
      'your',
      'passport'
    ]);
  });

  it('marks the correct token order as correct', () => {
    const result = compareSentenceAnswer(
      ['Please', 'show', 'me', 'your', 'passport'],
      'Please show me your passport.'
    );

    expect(result.isCorrect).toBe(true);
    expect(result.missingTokens).toEqual([]);
    expect(result.extraTokens).toEqual([]);
  });

  it('marks missing tokens as incorrect', () => {
    const result = compareSentenceAnswer(
      ['Please', 'show', 'passport'],
      'Please show me your passport.'
    );

    expect(result.isCorrect).toBe(false);
    expect(result.missingTokens.length).toBeGreaterThan(0);
  });
});
