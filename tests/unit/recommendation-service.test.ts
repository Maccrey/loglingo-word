import { describe, expect, it } from 'vitest';

import {
  buildRecommendationPrompt,
  parseRecommendationResponse,
  resolveRecommendationWords
} from '../../services/ai/src/recommendation';

describe('openai recommendation service', () => {
  it('maps recommendation inputs into a prompt', () => {
    const prompt = buildRecommendationPrompt({
      userId: 'user-1',
      weekId: '2026-W13',
      nativeLanguage: 'ko',
      targetLanguage: 'en',
      fallbackWords: ['passport', 'subway', 'reservation']
    });

    expect(prompt).toContain('User ID: user-1');
    expect(prompt).toContain('Week ID: 2026-W13');
    expect(prompt).toContain(
      'Fallback candidates: passport, subway, reservation'
    );
  });

  it('parses a valid response payload', () => {
    expect(
      parseRecommendationResponse(
        '{"words":["passport","subway","reservation"]}'
      )
    ).toEqual(['passport', 'subway', 'reservation']);
  });

  it('falls back when the response format is invalid', () => {
    const result = resolveRecommendationWords({
      userId: 'user-1',
      weekId: '2026-W13',
      nativeLanguage: 'ko',
      targetLanguage: 'en',
      fallbackWords: ['passport', 'subway', 'reservation'],
      rawResponse: '{"invalid":true}'
    });

    expect(result.source).toBe('fallback');
    expect(result.words).toEqual(['passport', 'subway', 'reservation']);
  });
});
