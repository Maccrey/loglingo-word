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

// 학습 단계: 단어 소개 → 뒤집기(의미확인) → 미니 리콜 → 완료
export type LearningPhase = 'introduce' | 'mini_recall' | 'done';

// 미니 리콜 문제: 의미를 보여주고 2지선다로 단어를 맞힘
export type MiniRecallQuestion = {
  wordId: string;
  prompt: string; // 의미 (meaning)
  correctTerm: string; // 정답 단어
  distractorTerm: string; // 오답 선택지
  options: [string, string]; // 섞인 순서로 보여줄 선택지
};

// 미니 리콜 라운드 상태
export type MiniRecallState = {
  questions: MiniRecallQuestion[];
  currentIndex: number;
  correctCount: number;
  answeredWordIds: string[]; // 이미 응답한 단어 ID
};

export type FlashcardSessionState = {
  // 전체 카드 큐
  cards: StudyCard[];
  currentIndex: number;
  flipped: boolean;

  // 학습 단계
  phase: LearningPhase;

  // 현재 배치(배치 사이즈 = 5): 배치 내 완료한 카드 수
  batchSize: number;
  batchCompletedCount: number;

  // 미니 리콜 상태 (phase === 'mini_recall' 일 때)
  miniRecall: MiniRecallState | null;

  // 오답 큐 (나중에 재출제)
  wrongWordQueue: WrongWordQueueEntry[];

  // SRS 진행 상태 맵
  progressMap: Record<string, VocabProgress>;

  // 로그
  logs: StudyLogEntry[];
  lastRating?: StudyRating;

  // 오늘 세션에서 새로 익힌 단어 수 (미니 리콜 완료 기준)
  todayLearnedCount: number;

  // 완료된 미니 사이클 횟수 (포인트 부여 기준)
  completedCycles: number;
};

// 배치 사이즈: 단어 5개 → 미니 리콜 → 다음 5개
const BATCH_SIZE = 5;

// 하루 목표 단어 수
export const DAILY_WORD_GOAL = 50;

// 미니 리콜에서 뽑을 단어 수 (배치 5개 중 3개 랜덤)
const MINI_RECALL_COUNT = 3;

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

/**
 * 배치(5개) 카드 중 랜덤으로 MINI_RECALL_COUNT개를 뽑아 2지선다 리콜 문제를 생성합니다.
 * 오답지는 같은 배치 내 다른 단어에서 가져옵니다.
 */
function buildMiniRecallQuestions(
  batchCards: StudyCard[]
): MiniRecallQuestion[] {
  if (batchCards.length < 2) {
    return [];
  }

  // 배치에서 최대 MINI_RECALL_COUNT개 셔플해서 선택
  const shuffled = [...batchCards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(MINI_RECALL_COUNT, batchCards.length));

  return selected.map((card) => {
    // 오답지: 같은 배치에서 다른 단어 랜덤 선택
    const others = batchCards.filter((c) => c.word.id !== card.word.id);
    const distractor = others[Math.floor(Math.random() * others.length)];
    const correctTerm = card.word.term;
    const distractorTerm = distractor?.word.term ?? card.word.term + '?';

    // 옵션 순서를 랜덤으로 섞음
    const options: [string, string] =
      Math.random() > 0.5
        ? [correctTerm, distractorTerm]
        : [distractorTerm, correctTerm];

    return {
      wordId: card.word.id,
      prompt: card.word.meaning,
      correctTerm,
      distractorTerm,
      options
    };
  });
}

export function createFlashcardSession(input?: {
  focusWordIds?: string[];
  learningLanguage?: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
  progressList?: VocabProgress[];
  limit?: number;
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

  // 하루 목표 50단어 기본값
  const limit = input?.limit ?? DAILY_WORD_GOAL;

  const cards =
    focusedCards.length > 0
      ? focusedCards
      : buildStudyQueue({
          curriculum,
          now: '2026-03-25T12:00:00.000Z',
          progress: progressList,
          wrongWordIds: [],
          limit
        });

  return {
    cards,
    currentIndex: 0,
    flipped: false,
    phase: 'introduce',
    batchSize: BATCH_SIZE,
    batchCompletedCount: 0,
    miniRecall: null,
    wrongWordQueue: [],
    progressMap: Object.fromEntries(
      progressList.map((item) => [item.wordId, item])
    ),
    logs: [],
    todayLearnedCount: 0,
    completedCycles: 0
  };
}

export function createDemoFlashcardSession(): FlashcardSessionState {
  return createFlashcardSession();
}

// 현재 단어 카드 조회 (phase가 introduce일 때만 의미 있음)
export function getCurrentCard(state: FlashcardSessionState): StudyCard | null {
  if (state.phase === 'done') {
    return null;
  }
  if (state.phase === 'mini_recall') {
    return null;
  }
  return state.cards[state.currentIndex] ?? null;
}

// 카드 뒤집기 (앞→뒤, 뒤→앞)
export function flipCurrentCard(
  state: FlashcardSessionState
): FlashcardSessionState {
  if (state.phase !== 'introduce') {
    return state;
  }
  const currentCard = state.cards[state.currentIndex];
  if (!currentCard) {
    return state;
  }
  return {
    ...state,
    flipped: !state.flipped
  };
}

/**
 * 단어 카드에 난이도를 선택하면 다음 카드로 넘어갑니다.
 * 5개 배치가 완료되면 미니 리콜 단계로 전환합니다.
 */
export function rateCurrentCard(
  state: FlashcardSessionState,
  rating: StudyRating,
  reviewedAt: string
): FlashcardSessionState {
  const currentCard = state.cards[state.currentIndex];

  if (!currentCard || state.phase !== 'introduce') {
    return state;
  }

  const currentProgress = state.progressMap[currentCard.word.id];
  const { progress, log } = applyStudyRating(
    currentCard.word.id,
    rating,
    reviewedAt,
    currentProgress
  );

  const nextBatchCompleted = state.batchCompletedCount + 1;
  const nextIndex = state.currentIndex + 1;
  const isLastCard = nextIndex >= state.cards.length;
  const isBatchFull = nextBatchCompleted >= state.batchSize;

  // 배치가 꽉 찼거나 전체 카드가 끝났을 때 미니 리콜 시작
  const shouldStartMiniRecall = isBatchFull || isLastCard;

  let miniRecall: MiniRecallState | null = null;
  let nextPhase: LearningPhase = 'introduce';

  if (shouldStartMiniRecall) {
    // 현재 배치 카드들 (방금 완료된 카드 포함)
    const batchStart = nextIndex - nextBatchCompleted;
    const batchEnd = nextIndex; // 포함
    const batchCards = state.cards.slice(batchStart, batchEnd);

    const questions = buildMiniRecallQuestions(batchCards);

    if (questions.length > 0) {
      miniRecall = {
        questions,
        currentIndex: 0,
        correctCount: 0,
        answeredWordIds: []
      };
      nextPhase = 'mini_recall';
    } else {
      // 리콜 문제를 만들 수 없는 경우 (카드가 1개뿐 등) → 바로 다음으로
      nextPhase = isLastCard ? 'done' : 'introduce';
    }
  }

  return {
    ...state,
    currentIndex: nextIndex,
    flipped: false,
    phase: nextPhase,
    batchCompletedCount: shouldStartMiniRecall ? 0 : nextBatchCompleted,
    miniRecall,
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

/**
 * 미니 리콜 문제에 답변합니다.
 * 모든 리콜 문제가 끝나면 다음 배치(introduce) 또는 done으로 넘어갑니다.
 * 미니 사이클 완료 시 completedCycles를 증가합니다 (포인트 부여 트리거).
 */
export function answerMiniRecall(
  state: FlashcardSessionState,
  selectedTerm: string
): FlashcardSessionState & { cycleJustCompleted: boolean } {
  if (state.phase !== 'mini_recall' || !state.miniRecall) {
    return { ...state, cycleJustCompleted: false };
  }

  const recall = state.miniRecall;
  const currentQuestion = recall.questions[recall.currentIndex];

  if (!currentQuestion) {
    return { ...state, cycleJustCompleted: false };
  }

  const isCorrect = selectedTerm === currentQuestion.correctTerm;
  const nextRecallIndex = recall.currentIndex + 1;
  const isLastQuestion = nextRecallIndex >= recall.questions.length;

  const updatedRecall: MiniRecallState = {
    ...recall,
    currentIndex: nextRecallIndex,
    correctCount: recall.correctCount + (isCorrect ? 1 : 0),
    answeredWordIds: [...recall.answeredWordIds, currentQuestion.wordId]
  };

  if (!isLastQuestion) {
    // 아직 리콜 문제가 남아있음
    return {
      ...state,
      miniRecall: updatedRecall,
      cycleJustCompleted: false
    };
  }

  // 미니 리콜 완료 → 다음 배치 또는 done
  const isAllDone = state.currentIndex >= state.cards.length;
  const nextPhase: LearningPhase = isAllDone ? 'done' : 'introduce';

  return {
    ...state,
    phase: nextPhase,
    miniRecall: null,
    todayLearnedCount: state.todayLearnedCount + recall.questions.length,
    completedCycles: state.completedCycles + 1,
    cycleJustCompleted: true // 포인트 부여 트리거
  };
}
