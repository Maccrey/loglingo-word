import { describe, expect, it } from 'vitest';

import {
  calculateForgettingCurveScore,
  calculateNextReviewSchedule,
  buildReviewSelection,
  getDueReviewCandidates,
  isReviewDueByForgettingCurve
} from '../../services/core/src/memory';

describe('forgetting curve', () => {
  it('reduces review urgency when strengths are higher', () => {
    const lowStrength = calculateForgettingCurveScore({
      progress: {
        wordId: 'hello',
        correctStreak: 1,
        storageStrength: 0.6,
        retrievalStrength: 0.5
      },
      reviewedAt: '2026-03-24T00:00:00.000Z',
      now: '2026-03-25T00:00:00.000Z'
    });

    const highStrength = calculateForgettingCurveScore({
      progress: {
        wordId: 'hello',
        correctStreak: 4,
        storageStrength: 1.8,
        retrievalStrength: 1.6
      },
      reviewedAt: '2026-03-24T00:00:00.000Z',
      now: '2026-03-25T00:00:00.000Z'
    });

    expect(highStrength.retentionScore).toBeGreaterThan(
      lowStrength.retentionScore
    );
    expect(highStrength.reviewUrgency).toBeLessThan(lowStrength.reviewUrgency);
  });

  it('reflects forgetting as time passes', () => {
    const shortGap = calculateForgettingCurveScore({
      progress: {
        wordId: 'hello',
        correctStreak: 2,
        storageStrength: 1.2,
        retrievalStrength: 1
      },
      reviewedAt: '2026-03-24T18:00:00.000Z',
      now: '2026-03-25T00:00:00.000Z'
    });

    const longGap = calculateForgettingCurveScore({
      progress: {
        wordId: 'hello',
        correctStreak: 2,
        storageStrength: 1.2,
        retrievalStrength: 1
      },
      reviewedAt: '2026-03-20T00:00:00.000Z',
      now: '2026-03-25T00:00:00.000Z'
    });

    expect(longGap.elapsedHours).toBeGreaterThan(shortGap.elapsedHours);
    expect(longGap.retentionScore).toBeLessThan(shortGap.retentionScore);
    expect(longGap.reviewUrgency).toBeGreaterThan(shortGap.reviewUrgency);
  });

  it('marks review due when retention drops below the threshold', () => {
    expect(
      isReviewDueByForgettingCurve(
        {
          progress: {
            wordId: 'passport',
            correctStreak: 1,
            storageStrength: 0.5,
            retrievalStrength: 0.4
          },
          reviewedAt: '2026-03-20T00:00:00.000Z',
          now: '2026-03-25T00:00:00.000Z'
        },
        0.4
      )
    ).toBe(true);
  });
});

describe('next review schedule', () => {
  it('creates longer intervals for easier ratings', () => {
    const progress = {
      wordId: 'hello',
      correctStreak: 2,
      storageStrength: 1.1,
      retrievalStrength: 1
    };

    const hard = calculateNextReviewSchedule({
      progress,
      rating: 'hard',
      reviewedAt: '2026-03-25T00:00:00.000Z'
    });
    const normal = calculateNextReviewSchedule({
      progress,
      rating: 'normal',
      reviewedAt: '2026-03-25T00:00:00.000Z'
    });
    const easy = calculateNextReviewSchedule({
      progress,
      rating: 'easy',
      reviewedAt: '2026-03-25T00:00:00.000Z'
    });

    expect(easy.intervalHours).toBeGreaterThan(normal.intervalHours);
    expect(normal.intervalHours).toBeGreaterThan(hard.intervalHours);
  });

  it('extends the interval for stronger memories', () => {
    const weak = calculateNextReviewSchedule({
      progress: {
        wordId: 'subway',
        correctStreak: 1,
        storageStrength: 0.8,
        retrievalStrength: 0.7
      },
      rating: 'normal',
      reviewedAt: '2026-03-25T00:00:00.000Z'
    });

    const strong = calculateNextReviewSchedule({
      progress: {
        wordId: 'subway',
        correctStreak: 4,
        storageStrength: 1.8,
        retrievalStrength: 1.6
      },
      rating: 'normal',
      reviewedAt: '2026-03-25T00:00:00.000Z'
    });

    expect(strong.intervalHours).toBeGreaterThan(weak.intervalHours);
  });

  it('calculates boundary timestamps without drifting dates', () => {
    const schedule = calculateNextReviewSchedule({
      progress: {
        wordId: 'passport',
        correctStreak: 0,
        storageStrength: 0.4,
        retrievalStrength: 0.4
      },
      rating: 'hard',
      reviewedAt: '2026-03-31T23:45:00.000Z'
    });

    expect(schedule.intervalHours).toBe(0.5);
    expect(schedule.nextReviewAt).toBe('2026-04-01T00:15:00.000Z');
  });
});

describe('review selection service', () => {
  it('returns only due review words in urgency order', () => {
    const dueReviews = getDueReviewCandidates({
      now: '2026-03-25T12:00:00.000Z',
      progress: [
        {
          wordId: 'subway',
          correctStreak: 2,
          storageStrength: 1,
          retrievalStrength: 0.9,
          nextReviewAt: '2026-03-25T08:00:00.000Z'
        },
        {
          wordId: 'passport',
          correctStreak: 1,
          storageStrength: 0.5,
          retrievalStrength: 0.4,
          nextReviewAt: '2026-03-24T00:00:00.000Z'
        },
        {
          wordId: 'hello',
          correctStreak: 4,
          storageStrength: 2,
          retrievalStrength: 1.8,
          nextReviewAt: '2026-03-27T00:00:00.000Z'
        }
      ]
    });

    expect(dueReviews.map((item) => item.word.id)).toEqual([
      'passport',
      'subway'
    ]);
  });

  it('mixes review and new words by the configured ratio', () => {
    const selection = buildReviewSelection({
      now: '2026-03-25T12:00:00.000Z',
      progress: [
        {
          wordId: 'subway',
          correctStreak: 2,
          storageStrength: 1,
          retrievalStrength: 0.9,
          nextReviewAt: '2026-03-25T08:00:00.000Z'
        },
        {
          wordId: 'passport',
          correctStreak: 1,
          storageStrength: 0.5,
          retrievalStrength: 0.4,
          nextReviewAt: '2026-03-24T00:00:00.000Z'
        }
      ],
      limit: 4,
      reviewShare: 0.5
    });

    expect(selection.mixedQueue).toHaveLength(4);
    expect(
      selection.mixedQueue.filter((item) => item.source === 'review')
    ).toHaveLength(2);
    expect(
      selection.mixedQueue.filter((item) => item.source === 'new')
    ).toHaveLength(2);
  });
});
