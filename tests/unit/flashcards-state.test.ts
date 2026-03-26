import { describe, expect, it } from 'vitest';

import {
  createDemoFlashcardSession,
  flipCurrentCard,
  getCurrentCard,
  rateCurrentCard
} from '../../apps/web/src/app/learn/flashcards';

describe('flashcard session state', () => {
  it('toggles the current card face', () => {
    const state = createDemoFlashcardSession();
    const flipped = flipCurrentCard(state);

    expect(state.flipped).toBe(false);
    expect(flipped.flipped).toBe(true);
  });

  it('moves to the next card after rating', () => {
    const state = flipCurrentCard(createDemoFlashcardSession());
    const firstCard = getCurrentCard(state);
    const nextState = rateCurrentCard(
      state,
      'normal',
      '2026-03-25T12:00:00.000Z'
    );

    expect(nextState.currentIndex).toBe(1);
    expect(nextState.flipped).toBe(false);
    expect(nextState.logs).toHaveLength(1);
    expect(nextState.logs[0]?.wordId).toBe(firstCard?.word.id);
  });

  it('adds hard-rated words to the wrong-word queue once', () => {
    const firstAttempt = rateCurrentCard(
      flipCurrentCard(createDemoFlashcardSession()),
      'hard',
      '2026-03-25T12:00:00.000Z'
    );

    expect(firstAttempt.wrongWordQueue).toEqual([
      {
        wordId: 'hello',
        queuedAt: '2026-03-25T12:00:00.000Z'
      }
    ]);

    const repeatedAttempt = {
      ...firstAttempt,
      currentIndex: 0,
      flipped: true
    };

    const deduped = rateCurrentCard(
      repeatedAttempt,
      'hard',
      '2026-03-25T12:05:00.000Z'
    );

    expect(deduped.wrongWordQueue).toHaveLength(1);
  });
});
