import {
  type CurriculumUnit,
  type CurriculumWord
} from '@wordflow/shared/curriculum';
import {
  vocabProgressSchema,
  type VocabProgress
} from '@wordflow/shared/types';

import { curriculumSeed } from './curriculum';

export type StudyCardReason = 'retry' | 'review' | 'new';

export type StudyCard = {
  word: CurriculumWord;
  reason: StudyCardReason;
};

export type BuildStudyQueueInput = {
  curriculum?: CurriculumUnit[];
  progress?: VocabProgress[];
  wrongWordIds?: string[];
  now: string;
  limit?: number;
};

export type StudyRating = 'easy' | 'normal' | 'hard';

export type StudyLogEntry = {
  wordId: string;
  rating: StudyRating;
  reviewedAt: string;
  previousProgress: VocabProgress | null;
  nextProgress: VocabProgress;
};

export type WrongWordQueueEntry = {
  wordId: string;
  queuedAt: string;
};

const DEFAULT_STUDY_LIMIT = 10;

function getCurriculumWords(units: CurriculumUnit[]): CurriculumWord[] {
  return units.flatMap((unit) => unit.words);
}

function getProgressMap(
  progressList: VocabProgress[]
): Map<string, VocabProgress> {
  return new Map(
    progressList.map((progress) => [
      progress.wordId,
      vocabProgressSchema.parse(progress)
    ])
  );
}

function appendCards(
  queue: StudyCard[],
  cards: StudyCard[],
  limit: number
): StudyCard[] {
  const seenWordIds = new Set(queue.map((card) => card.word.id));

  for (const card of cards) {
    if (queue.length >= limit) {
      break;
    }

    if (seenWordIds.has(card.word.id)) {
      continue;
    }

    queue.push(card);
    seenWordIds.add(card.word.id);
  }

  return queue;
}

export function buildStudyQueue(input: BuildStudyQueueInput): StudyCard[] {
  const limit = input.limit ?? DEFAULT_STUDY_LIMIT;
  const curriculum = input.curriculum ?? curriculumSeed;
  const progressMap = getProgressMap(input.progress ?? []);
  const nowTime = new Date(input.now).getTime();
  const words = getCurriculumWords(curriculum);

  const wordMap = new Map(words.map((word) => [word.id, word]));
  const retryCards = (input.wrongWordIds ?? [])
    .map((wordId) => wordMap.get(wordId))
    .filter((word): word is CurriculumWord => Boolean(word))
    .map((word) => ({
      word,
      reason: 'retry' as const
    }));

  const reviewCards = words
    .filter((word) => {
      const progress = progressMap.get(word.id);

      if (!progress?.nextReviewAt) {
        return false;
      }

      return new Date(progress.nextReviewAt).getTime() <= nowTime;
    })
    .sort((left, right) => {
      const leftTime = new Date(
        progressMap.get(left.id)?.nextReviewAt ?? input.now
      ).getTime();
      const rightTime = new Date(
        progressMap.get(right.id)?.nextReviewAt ?? input.now
      ).getTime();

      return leftTime - rightTime;
    })
    .map((word) => ({
      word,
      reason: 'review' as const
    }));

  const newCards = words
    .filter((word) => !progressMap.has(word.id))
    .map((word) => ({
      word,
      reason: 'new' as const
    }));

  return appendCards(
    appendCards(appendCards([], retryCards, limit), reviewCards, limit),
    newCards,
    limit
  );
}

function addMinutes(timestamp: string, minutes: number): string {
  return new Date(
    new Date(timestamp).getTime() + minutes * 60_000
  ).toISOString();
}

function addDays(timestamp: string, days: number): string {
  return addMinutes(timestamp, days * 24 * 60);
}

function createInitialProgress(wordId: string): VocabProgress {
  return {
    wordId,
    correctStreak: 0,
    storageStrength: 0.4,
    retrievalStrength: 0.4
  };
}

export function applyStudyRating(
  wordId: string,
  rating: StudyRating,
  reviewedAt: string,
  currentProgress?: VocabProgress
): { progress: VocabProgress; log: StudyLogEntry } {
  const previousProgress = currentProgress
    ? vocabProgressSchema.parse(currentProgress)
    : createInitialProgress(wordId);

  let nextProgress: VocabProgress;

  switch (rating) {
    case 'easy':
    case 'normal': {
      const nextCorrectStreak = previousProgress.correctStreak + 1;
      // 첫 번째 시도에서 맞췄거나, 오답 후 3번 연속 정답 시 바로 마스터(제외)
      const isMastered = !currentProgress || nextCorrectStreak >= 3;
      const nextReviewAt = isMastered ? undefined : addDays(reviewedAt, 1);

      nextProgress = {
        wordId,
        correctStreak: nextCorrectStreak,
        storageStrength: Number(
          Math.min(2, previousProgress.storageStrength + 0.3).toFixed(2)
        ),
        retrievalStrength: Number(
          Math.min(2, previousProgress.retrievalStrength + 0.25).toFixed(2)
        ),
        ...(nextReviewAt ? { nextReviewAt } : {})
      };
      break;
    }
    case 'hard':
      nextProgress = {
        wordId,
        correctStreak: 0,
        storageStrength: Number(
          Math.max(0.2, previousProgress.storageStrength - 0.2).toFixed(2)
        ),
        retrievalStrength: Number(
          Math.max(0.1, previousProgress.retrievalStrength - 0.3).toFixed(2)
        ),
        nextReviewAt: reviewedAt
      };
      break;
  }

  return {
    progress: nextProgress,
    log: {
      wordId,
      rating,
      reviewedAt,
      previousProgress: currentProgress ? previousProgress : null,
      nextProgress
    }
  };
}

export function enqueueWrongWord(
  queue: WrongWordQueueEntry[],
  wordId: string,
  queuedAt: string
): WrongWordQueueEntry[] {
  if (queue.some((entry) => entry.wordId === wordId)) {
    return queue;
  }

  return [...queue, { wordId, queuedAt }];
}

export function updateWrongWordQueue(
  queue: WrongWordQueueEntry[],
  wordId: string,
  rating: StudyRating,
  reviewedAt: string
): WrongWordQueueEntry[] {
  if (rating !== 'hard') {
    return queue;
  }

  return enqueueWrongWord(queue, wordId, reviewedAt);
}
