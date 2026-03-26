import { describe, expect, it } from 'vitest';

import {
  FirestoreAIRecommendationRepository,
  handleAIRecommendation,
  type AIRecommendationDocumentStore,
  type AIRecommendationRecord,
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

  it('stores a weekly recommendation result', async () => {
    const store = new Map<string, AIRecommendationRecord>();
    const repository = new FirestoreAIRecommendationRepository({
      async get(userId, weekId) {
        return store.get(`${userId}:${weekId}`) ?? null;
      },
      async set(record) {
        store.set(`${record.userId}:${record.weekId}`, record);
      }
    } satisfies AIRecommendationDocumentStore);

    const result = await handleAIRecommendation(
      {
        userId: 'user-1',
        nativeLanguage: 'ko',
        targetLanguage: 'en',
        now: '2026-03-26T00:00:00.000Z',
        fallbackWords: ['passport', 'subway', 'reservation']
      },
      {
        repository,
        client: {
          async complete() {
            return {
              rawResponse: '{"words":["airport","hotel","ticket"]}'
            };
          }
        }
      }
    );

    expect(result.recommendation.weekId).toBe('2026-W13');
    expect(result.recommendation.words).toEqual(['airport', 'hotel', 'ticket']);
    expect(store.get('user-1:2026-W13')).toMatchObject({
      source: 'openai'
    });
  });

  it('returns the existing recommendation for the same week', async () => {
    const repository = new FirestoreAIRecommendationRepository({
      async get() {
        return {
          userId: 'user-1',
          weekId: '2026-W13',
          words: ['passport', 'subway', 'reservation'],
          source: 'fallback',
          prompt: 'cached prompt',
          requestedAt: '2026-03-24T00:00:00.000Z'
        };
      },
      async set() {
        throw new Error('should not save');
      }
    });

    const result = await handleAIRecommendation(
      {
        userId: 'user-1',
        nativeLanguage: 'ko',
        targetLanguage: 'en',
        now: '2026-03-26T00:00:00.000Z',
        lastRequestedAt: '2026-03-24T00:00:00.000Z',
        fallbackWords: ['passport', 'subway', 'reservation']
      },
      {
        repository,
        client: {
          async complete() {
            throw new Error('should not call');
          }
        }
      }
    );

    expect(result.window.allowed).toBe(false);
    expect(result.recommendation.words).toEqual([
      'passport',
      'subway',
      'reservation'
    ]);
  });
});
