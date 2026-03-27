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

import { curriculumSeed } from '@wordflow/core/curriculum';
import {
  getCurriculumByStandardLevel
} from '@wordflow/core/curriculum';
import {
  getDefaultLearningLevel,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from '@wordflow/shared/learning-preferences';

export type FlashcardSessionState = {
  cards: StudyCard[];
  currentIndex: number;
  flipped: boolean;
  progressMap: Record<string, VocabProgress>;
  logs: StudyLogEntry[];
  wrongWordQueue: WrongWordQueueEntry[];
  lastRating?: StudyRating;
};

function buildFocusedCards(wordIds: string[]): StudyCard[] {
  const wordMap = new Map(
    curriculumSeed.flatMap((unit) => unit.words).map((word) => [word.id, word])
  );

  return wordIds
    .map((wordId) => wordMap.get(wordId))
    .filter((word): word is NonNullable<typeof word> => Boolean(word))
    .map((word) => ({
      word,
      reason: 'new' as const
    }));
}

export function createFlashcardSession(input?: {
  focusWordIds?: string[];
  learningLanguage?: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
  progressList?: VocabProgress[];
}): FlashcardSessionState {
  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const curriculum = getCurriculumByStandardLevel(
    learningLanguage,
    learningLevel
  );
  const progressList: VocabProgress[] = input?.progressList ?? [];

  const focusedCards =
    input?.focusWordIds && input.focusWordIds.length > 0
      ? buildFocusedCards(input.focusWordIds)
      : [];
  const cards =
    focusedCards.length > 0
      ? focusedCards
      : buildStudyQueue({
          curriculum,
          now: '2026-03-25T12:00:00.000Z',
          progress: progressList,
          wrongWordIds: [],
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

export function createDemoFlashcardSession(): FlashcardSessionState {
  return createFlashcardSession();
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
