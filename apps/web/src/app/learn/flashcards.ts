import {
  applyStudyRating,
  buildStudyQueue,
  type StudyCard,
  type StudyLogEntry,
  type StudyRating,
  type WrongWordQueueEntry,
  updateWrongWordQueue
} from '@wordflow/core/learning';
import { type VocabProgress } from '@wordflow/shared/types';

export type FlashcardSessionState = {
  cards: StudyCard[];
  currentIndex: number;
  flipped: boolean;
  progressMap: Record<string, VocabProgress>;
  logs: StudyLogEntry[];
  wrongWordQueue: WrongWordQueueEntry[];
  lastRating?: StudyRating;
};

export function createDemoFlashcardSession(): FlashcardSessionState {
  const progressList: VocabProgress[] = [
    {
      wordId: 'subway',
      correctStreak: 2,
      storageStrength: 1.1,
      retrievalStrength: 0.9,
      nextReviewAt: '2026-03-25T08:00:00.000Z'
    }
  ];

  const cards = buildStudyQueue({
    now: '2026-03-25T12:00:00.000Z',
    progress: progressList,
    wrongWordIds: ['hello'],
    limit: 4
  });

  return {
    cards,
    currentIndex: 0,
    flipped: false,
    progressMap: Object.fromEntries(
      progressList.map((item) => [item.wordId, item])
    ),
    logs: [],
    wrongWordQueue: []
  };
}

export function getCurrentCard(state: FlashcardSessionState): StudyCard | null {
  return state.cards[state.currentIndex] ?? null;
}

export function flipCurrentCard(
  state: FlashcardSessionState
): FlashcardSessionState {
  if (!getCurrentCard(state)) {
    return state;
  }

  return {
    ...state,
    flipped: !state.flipped
  };
}

export function rateCurrentCard(
  state: FlashcardSessionState,
  rating: StudyRating,
  reviewedAt: string
): FlashcardSessionState {
  const currentCard = getCurrentCard(state);

  if (!currentCard) {
    return state;
  }

  const currentProgress = state.progressMap[currentCard.word.id];
  const { progress, log } = applyStudyRating(
    currentCard.word.id,
    rating,
    reviewedAt,
    currentProgress
  );

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    flipped: false,
    lastRating: rating,
    progressMap: {
      ...state.progressMap,
      [progress.wordId]: progress
    },
    logs: [...state.logs, log],
    wrongWordQueue: updateWrongWordQueue(
      state.wrongWordQueue,
      currentCard.word.id,
      rating,
      reviewedAt
    )
  };
}
