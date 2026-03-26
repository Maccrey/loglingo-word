import {
  vocabProgressSchema,
  type VocabProgress
} from '@wordflow/shared/types';
import {
  type CurriculumUnit,
  type CurriculumWord
} from '@wordflow/shared/curriculum';
import { type StudyRating } from './learning';
import { curriculumSeed } from './curriculum';

export type ForgettingCurveInput = {
  progress: VocabProgress;
  reviewedAt: string;
  now: string;
};

export type ForgettingCurveScore = {
  elapsedHours: number;
  retentionScore: number;
  reviewUrgency: number;
};

export type NextReviewScheduleInput = {
  progress: VocabProgress;
  rating: StudyRating;
  reviewedAt: string;
};

export type NextReviewSchedule = {
  intervalHours: number;
  nextReviewAt: string;
};

export type DueReviewCandidate = {
  word: CurriculumWord;
  progress: VocabProgress;
  retentionScore: number;
  reviewUrgency: number;
};

export type BuildReviewSelectionInput = {
  now: string;
  progress: VocabProgress[];
  curriculum?: CurriculumUnit[];
  limit?: number;
  reviewShare?: number;
};

export type ReviewSelectionResult = {
  dueReviews: DueReviewCandidate[];
  mixedQueue: Array<
    | { word: CurriculumWord; source: 'review'; reviewUrgency: number }
    | { word: CurriculumWord; source: 'new' }
  >;
};

function getElapsedHours(reviewedAt: string, now: string): number {
  const elapsedMs = new Date(now).getTime() - new Date(reviewedAt).getTime();

  return Math.max(0, elapsedMs / (1000 * 60 * 60));
}

export function calculateForgettingCurveScore(
  input: ForgettingCurveInput
): ForgettingCurveScore {
  const progress = vocabProgressSchema.parse(input.progress);
  const elapsedHours = getElapsedHours(input.reviewedAt, input.now);
  const strength = Math.max(
    0.1,
    progress.storageStrength * 0.55 + progress.retrievalStrength * 0.45
  );

  const forgettingRate = elapsedHours / (strength * 24);
  const retentionScore = Number(Math.exp(-forgettingRate).toFixed(4));
  const reviewUrgency = Number((1 - retentionScore).toFixed(4));

  return {
    elapsedHours: Number(elapsedHours.toFixed(2)),
    retentionScore,
    reviewUrgency
  };
}

export function isReviewDueByForgettingCurve(
  input: ForgettingCurveInput,
  threshold = 0.5
): boolean {
  return calculateForgettingCurveScore(input).retentionScore <= threshold;
}

function getBaseIntervalHours(rating: StudyRating): number {
  switch (rating) {
    case 'easy':
      return 72;
    case 'normal':
      return 24;
    case 'hard':
      return 0.5;
  }
}

function addHours(timestamp: string, hours: number): string {
  return new Date(
    new Date(timestamp).getTime() + hours * 60 * 60 * 1000
  ).toISOString();
}

function getCurriculumWords(units: CurriculumUnit[]): CurriculumWord[] {
  return units.flatMap((unit) => unit.words);
}

export function calculateNextReviewSchedule(
  input: NextReviewScheduleInput
): NextReviewSchedule {
  const progress = vocabProgressSchema.parse(input.progress);
  const strength = Math.max(
    0.5,
    progress.storageStrength * 0.55 + progress.retrievalStrength * 0.45
  );
  const baseIntervalHours = getBaseIntervalHours(input.rating);
  const streakBonus = Math.min(progress.correctStreak * 2, 12);
  const strengthMultiplier =
    input.rating === 'hard' ? 1 : Math.min(2.2, 0.85 + strength * 0.35);
  const rawIntervalHours =
    input.rating === 'hard'
      ? baseIntervalHours
      : (baseIntervalHours + streakBonus) * strengthMultiplier;
  const intervalHours = Number(Math.max(0.5, rawIntervalHours).toFixed(2));

  return {
    intervalHours,
    nextReviewAt: addHours(input.reviewedAt, intervalHours)
  };
}

export function getDueReviewCandidates(
  input: Pick<BuildReviewSelectionInput, 'now' | 'progress' | 'curriculum'>
): DueReviewCandidate[] {
  const curriculum = input.curriculum ?? curriculumSeed;
  const words = getCurriculumWords(curriculum);
  const wordMap = new Map(words.map((word) => [word.id, word]));

  return input.progress
    .map((item) => vocabProgressSchema.parse(item))
    .flatMap((progress) => {
      const word = wordMap.get(progress.wordId);

      if (!word || !progress.nextReviewAt) {
        return [];
      }

      const dueBySchedule =
        new Date(progress.nextReviewAt).getTime() <=
        new Date(input.now).getTime();
      const score = calculateForgettingCurveScore({
        progress,
        reviewedAt: progress.nextReviewAt,
        now: input.now
      });

      if (!dueBySchedule && score.retentionScore > 0.5) {
        return [];
      }

      return [
        {
          word,
          progress,
          retentionScore: score.retentionScore,
          reviewUrgency: score.reviewUrgency
        }
      ];
    })
    .sort((left, right) => right.reviewUrgency - left.reviewUrgency);
}

export function buildReviewSelection(
  input: BuildReviewSelectionInput
): ReviewSelectionResult {
  const curriculum = input.curriculum ?? curriculumSeed;
  const limit = input.limit ?? 10;
  const reviewShare = input.reviewShare ?? 0.6;
  const words = getCurriculumWords(curriculum);
  const dueReviews = getDueReviewCandidates(input);
  const progressWordIds = new Set(input.progress.map((item) => item.wordId));
  const reviewLimit = Math.min(
    dueReviews.length,
    Math.max(1, Math.round(limit * reviewShare))
  );
  const selectedReviews = dueReviews.slice(0, reviewLimit);
  const selectedReviewIds = new Set(
    selectedReviews.map((item) => item.word.id)
  );
  const newWords = words
    .filter(
      (word) => !progressWordIds.has(word.id) && !selectedReviewIds.has(word.id)
    )
    .slice(0, Math.max(0, limit - selectedReviews.length));

  return {
    dueReviews,
    mixedQueue: [
      ...selectedReviews.map((item) => ({
        word: item.word,
        source: 'review' as const,
        reviewUrgency: item.reviewUrgency
      })),
      ...newWords.map((word) => ({
        word,
        source: 'new' as const
      }))
    ]
  };
}
