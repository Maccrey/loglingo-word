import { describe, expect, it } from 'vitest';

import {
  applyStudyRating,
  buildStudyQueue,
  enqueueWrongWord,
  updateWrongWordQueue
} from '../../services/core/src/learning';

describe('learning queue', () => {
  it('places due review cards before new cards', () => {
    const queue = buildStudyQueue({
      now: '2026-03-25T12:00:00.000Z',
      progress: [
        {
          wordId: 'subway',
          correctStreak: 2,
          storageStrength: 1.1,
          retrievalStrength: 1,
          nextReviewAt: '2026-03-25T08:00:00.000Z'
        }
      ],
      limit: 3
    });

    expect(queue[0]).toMatchObject({
      word: { id: 'subway' },
      reason: 'review'
    });
    expect(queue[1]?.reason).toBe('new');
  });

  it('re-exposes wrong answers before the normal review queue', () => {
    const queue = buildStudyQueue({
      now: '2026-03-25T12:00:00.000Z',
      wrongWordIds: ['hello'],
      progress: [
        {
          wordId: 'subway',
          correctStreak: 3,
          storageStrength: 1.2,
          retrievalStrength: 1.1,
          nextReviewAt: '2026-03-25T07:00:00.000Z'
        }
      ],
      limit: 3
    });

    expect(queue[0]).toMatchObject({
      word: { id: 'hello' },
      reason: 'retry'
    });
    expect(queue[1]).toMatchObject({
      word: { id: 'subway' },
      reason: 'review'
    });
  });

  it('falls back to new cards when there is no progress data', () => {
    const queue = buildStudyQueue({
      now: '2026-03-25T12:00:00.000Z',
      limit: 2
    });

    expect(queue).toHaveLength(2);
    expect(queue.every((card) => card.reason === 'new')).toBe(true);
    expect(queue.map((card) => card.word.id)).toEqual(['hello', 'thanks']);
  });
});

describe('study progress updates', () => {
  it('increases strengths after an easy answer', () => {
    const result = applyStudyRating(
      'hello',
      'easy',
      '2026-03-25T12:00:00.000Z',
      {
        wordId: 'hello',
        correctStreak: 1,
        storageStrength: 1,
        retrievalStrength: 0.8,
        nextReviewAt: '2026-03-25T00:00:00.000Z'
      }
    );

    expect(result.progress.correctStreak).toBe(2);
    expect(result.progress.storageStrength).toBe(1.5);
    expect(result.progress.retrievalStrength).toBe(1.2);
    expect(result.progress.nextReviewAt).toBe('2026-03-29T12:00:00.000Z');
    expect(result.log.nextProgress.wordId).toBe('hello');
  });

  it('resets streak and schedules a quick retry after a hard answer', () => {
    const result = applyStudyRating(
      'hello',
      'hard',
      '2026-03-25T12:00:00.000Z',
      {
        wordId: 'hello',
        correctStreak: 3,
        storageStrength: 0.7,
        retrievalStrength: 0.6,
        nextReviewAt: '2026-03-27T00:00:00.000Z'
      }
    );

    expect(result.progress.correctStreak).toBe(0);
    expect(result.progress.storageStrength).toBe(0.5);
    expect(result.progress.retrievalStrength).toBe(0.3);
    expect(result.progress.nextReviewAt).toBe('2026-03-25T12:10:00.000Z');
  });

  it('creates progress for a first-time study result', () => {
    const result = applyStudyRating(
      'passport',
      'normal',
      '2026-03-25T12:00:00.000Z'
    );

    expect(result.log.previousProgress).toBeNull();
    expect(result.progress.wordId).toBe('passport');
    expect(result.progress.correctStreak).toBe(1);
    expect(result.progress.storageStrength).toBe(0.7);
    expect(result.progress.retrievalStrength).toBe(0.6);
  });
});

describe('wrong word queue', () => {
  it('stores a hard-rated word in the wrong-word queue', () => {
    const queue = updateWrongWordQueue(
      [],
      'hello',
      'hard',
      '2026-03-25T12:00:00.000Z'
    );

    expect(queue).toEqual([
      {
        wordId: 'hello',
        queuedAt: '2026-03-25T12:00:00.000Z'
      }
    ]);
  });

  it('keeps only one entry per word', () => {
    const queue = enqueueWrongWord(
      [
        {
          wordId: 'hello',
          queuedAt: '2026-03-25T12:00:00.000Z'
        }
      ],
      'hello',
      '2026-03-25T12:05:00.000Z'
    );

    expect(queue).toHaveLength(1);
    expect(queue[0]?.queuedAt).toBe('2026-03-25T12:00:00.000Z');
  });
});
