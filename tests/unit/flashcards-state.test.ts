import { describe, expect, it } from 'vitest';

import {
  answerMiniRecall,
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

  it('moves to the next card after advancing', () => {
    const state = flipCurrentCard(createDemoFlashcardSession());
    const firstCard = getCurrentCard(state);
    const nextState = rateCurrentCard(
      state,
      'normal',
      '2026-03-25T12:00:00.000Z'
    );

    expect(nextState.currentIndex).toBe(1);
    expect(nextState.flipped).toBe(false);
    expect(nextState.logs).toHaveLength(0);
    expect(nextState.seenWordIds).toEqual([firstCard?.word.id]);
  });

  it('adds wrong mini recall answers to the wrong-word queue once', () => {
    let state = createDemoFlashcardSession();
    for (let index = 0; index < 5; index += 1) {
      state = rateCurrentCard(
        flipCurrentCard(state),
        'normal',
        `2026-03-25T12:0${index}:00.000Z`
      );
    }

    const currentQuestion = state.miniRecall?.questions[0];
    expect(currentQuestion).toBeTruthy();

    const firstAttempt = answerMiniRecall(
      state,
      currentQuestion?.distractorTerm ?? '',
      '2026-03-25T12:10:00.000Z'
    );

    expect(firstAttempt.wrongWordQueue).toEqual([
      {
        wordId: currentQuestion?.wordId,
        queuedAt: '2026-03-25T12:10:00.000Z'
      }
    ]);

    const deduped = answerMiniRecall(
      {
        ...firstAttempt,
        miniRecall: {
          ...(firstAttempt.miniRecall ?? state.miniRecall!),
          currentIndex: 0
        }
      },
      currentQuestion?.distractorTerm ?? '',
      '2026-03-25T12:11:00.000Z'
    );

    expect(deduped.wrongWordQueue).toHaveLength(1);
  });
});
