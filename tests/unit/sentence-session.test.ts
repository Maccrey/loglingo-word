import { describe, expect, it } from 'vitest';

import {
  createDemoSentenceSession,
  moveTokenToAnswer,
  resetSentenceSession,
  submitSentenceSession
} from '../../apps/web/src/app/sentence/sentenceSession';

describe('sentence session state', () => {
  it('moves a token from the pool to the answer area', () => {
    const initial = createDemoSentenceSession();
    const moved = moveTokenToAnswer(initial, initial.poolTokens[0]!.id);

    expect(moved.poolTokens).toHaveLength(initial.poolTokens.length - 1);
    expect(moved.assembledTokens).toHaveLength(1);
  });

  it('submits the assembled sentence and resets it', () => {
    let state = createDemoSentenceSession();

    for (const token of state.exercise.tokens) {
      state = moveTokenToAnswer(state, token.id);
    }

    const submitted = submitSentenceSession(state);
    const reset = resetSentenceSession(submitted);

    expect(submitted.feedback.status).toBe('success');
    expect(reset.assembledTokens).toEqual([]);
    expect(reset.poolTokens).toHaveLength(reset.exercise.tokens.length);
  });
});
