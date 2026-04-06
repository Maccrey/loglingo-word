'use client';

import { vocabProgressSchema, type VocabProgress } from '@wordflow/shared/types';

const LEARNING_PROGRESS_KEY = 'mock_learning_progress';

export function isWordMastered(progress: VocabProgress): boolean {
  const parsed = vocabProgressSchema.parse(progress);

  // 단어가 완전히 암기되었는지 여부는 첫 번에 맞춰서(nextReviewAt 이 undefined 됨) 이거나
  // 틀렸던 단어를 3번 연속 맞춰서(correctStreak >= 3) 달성됩니다.
  // 객체 속성에 nextReviewAt이 없으면(undefined) 리뷰 일정이 없으므로 완전 마스터 상태입니다.
  return parsed.correctStreak >= 3 || parsed.nextReviewAt === undefined;
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
