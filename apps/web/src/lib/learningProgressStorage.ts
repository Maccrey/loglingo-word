'use client';

import { vocabProgressSchema, type VocabProgress } from '@wordflow/shared/types';

const LEARNING_PROGRESS_KEY = 'mock_learning_progress';

export function isWordMastered(progress: VocabProgress): boolean {
  const parsed = vocabProgressSchema.parse(progress);

  return (
    parsed.correctStreak >= 2 &&
    parsed.storageStrength >= 1 &&
    parsed.retrievalStrength >= 0.8
  );
}

export function loadStoredLearningProgress(): VocabProgress[] {
  const stored = window.localStorage.getItem(LEARNING_PROGRESS_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => vocabProgressSchema.safeParse(item))
      .flatMap((result) => (result.success ? [result.data] : []));
  } catch {
    return [];
  }
}

export function saveStoredLearningProgress(progressList: VocabProgress[]) {
  const sanitized = progressList.map((item) => vocabProgressSchema.parse(item));
  window.localStorage.setItem(
    LEARNING_PROGRESS_KEY,
    JSON.stringify(sanitized)
  );
}

export function readStoredLearningProgressSnapshot(): VocabProgress[] {
  if (typeof window === 'undefined') {
    return [];
  }

  return loadStoredLearningProgress();
}

export function upsertLearningProgress(
  current: VocabProgress[],
  nextProgress: VocabProgress[]
): VocabProgress[] {
  const progressMap = new Map(
    current.map((item) => [item.wordId, vocabProgressSchema.parse(item)])
  );

  for (const item of nextProgress) {
    const parsed = vocabProgressSchema.parse(item);
    progressMap.set(parsed.wordId, parsed);
  }

  return [...progressMap.values()];
}

export function calculateMasteredWordRatio(
  wordIds: string[],
  progressList: VocabProgress[]
): number {
  if (wordIds.length === 0) {
    return 0;
  }

  const progressMap = new Map(progressList.map((item) => [item.wordId, item]));
  const masteredCount = wordIds.filter((wordId) => {
    const progress = progressMap.get(wordId);
    return progress ? isWordMastered(progress) : false;
  }).length;

  return masteredCount / wordIds.length;
}
