import {
  buildMultipleChoiceQuiz,
  gradeShortAnswer,
  type MultipleChoiceQuiz,
  type ShortAnswerGrade
} from '@wordflow/core/quiz';
import { getCurriculumByStandardLevel } from '@wordflow/core/curriculum';
import { type CurriculumWord } from '@wordflow/shared/curriculum';
import {
  getDefaultLearningLevel,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from '@wordflow/shared/learning-preferences';

export type QuizFeedback = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export type ReviewPair = {
  wordId: string;
  leftText: string;
  leftReading?: string;
  rightText: string;
};

export type ReviewRoundState = {
  pairs: ReviewPair[];
  leftWordIds: string[];
  rightWordIds: string[];
  matchedWordIds: string[];
  selectedLeftWordId: string | null;
  completed: boolean;
};

export type QuizSessionState = {
  baseQuestionWordIds: string[];
  currentQuestionIndex: number;
  multipleChoiceQuiz: MultipleChoiceQuiz;
  selectedOptionId?: string;
  shortAnswer: string;
  shortAnswerGrade?: ShortAnswerGrade;
  loading: boolean;
  wrongAttempts: number;
  advanceReady: boolean;
  completed: boolean;
  feedback: QuizFeedback;
  correctWordIds: string[];
  reviewRound: ReviewRoundState | null;
};

function shuffleItems<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex]!;
    next[randomIndex] = current!;
  }

  return next;
}

function buildBaseQuestionWordIds(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  questionCount: number,
  randomizeQuestions = true
) {
  const curriculum = getCurriculumByStandardLevel(
    learningLanguage,
    learningLevel
  );
  const words = curriculum.flatMap((unit) => unit.words);
  const baseQuestionCount = Math.max(10, questionCount);
  const wordIds = (
    randomizeQuestions ? shuffleItems(words.map((word) => word.id)) : words.map((word) => word.id)
  ).slice(0, Math.max(1, Math.min(baseQuestionCount, words.length)));

  return wordIds;
}

function buildWordMap(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel
) {
  return new Map(
    getCurriculumByStandardLevel(learningLanguage, learningLevel)
      .flatMap((unit) => unit.words)
      .map((word) => [word.id, word])
  );
}

function buildQuizForQuestion(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  baseQuestionWordIds: string[],
  index: number,
  randomizeOptions = true
): MultipleChoiceQuiz {
  return buildMultipleChoiceQuiz({
    wordId: baseQuestionWordIds[index] ?? baseQuestionWordIds[0] ?? 'hello',
    curriculum: getCurriculumByStandardLevel(learningLanguage, learningLevel),
    randomizeOptions
  });
}

function createReviewRound(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  currentChunkWordIds: string[],
  previousCorrectWordIds: string[]
): ReviewRoundState | null {
  const wordMap = buildWordMap(learningLanguage, learningLevel);
  const pairs: ReviewPair[] = [];
  const seen = new Set<string>();

  for (const wordId of currentChunkWordIds) {
    const word = wordMap.get(wordId);

    if (!word || seen.has(wordId)) {
      continue;
    }

    pairs.push({
      wordId,
      leftText: word.term,
      ...(word.reading ? { leftReading: word.reading } : {}),
      rightText: word.meaning
    });
    seen.add(wordId);
  }

  const previousDistinct = previousCorrectWordIds.find(
    (wordId) => !seen.has(wordId)
  );

  if (previousDistinct) {
    const word = wordMap.get(previousDistinct);

    if (word) {
      pairs.push({
        wordId: previousDistinct,
        leftText: word.term,
        ...(word.reading ? { leftReading: word.reading } : {}),
        rightText: word.meaning
      });
      seen.add(previousDistinct);
    }
  }

  if (pairs.length === 0) {
    return null;
  }

  const leftWordIds = pairs.map((pair) => pair.wordId);
  const rightWordIds = shuffleItems(pairs.map((pair) => pair.wordId));

  return {
    pairs,
    leftWordIds,
    rightWordIds,
    matchedWordIds: [],
    selectedLeftWordId: null,
    completed: false
  };
}

function markCorrect(state: QuizSessionState, message: string): QuizSessionState {
  const currentWordId = state.baseQuestionWordIds[state.currentQuestionIndex];
  const correctWordIds =
    currentWordId && !state.correctWordIds.includes(currentWordId)
      ? [...state.correctWordIds, currentWordId]
      : state.correctWordIds;

  return {
    ...state,
    correctWordIds,
    feedback: {
      status: 'success',
      message
    },
    wrongAttempts: 0
  };
}

function markWrong(state: QuizSessionState, finalMessage: string): QuizSessionState {
  const nextWrongAttempts = state.wrongAttempts + 1;

  if (nextWrongAttempts >= 2) {
    return {
      ...state,
      feedback: {
        status: 'error',
        message: finalMessage
      },
      wrongAttempts: nextWrongAttempts
    };
  }

  return {
    ...state,
    feedback: {
      status: 'error',
      message: '틀렸어요. 천천히 생각해보세요.'
    },
    wrongAttempts: nextWrongAttempts
  };
}

export function createDemoQuizSession(input?: {
  learningLanguage?: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
  questionCount?: number;
  randomizeQuestions?: boolean;
}): QuizSessionState {
  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const baseQuestionWordIds = buildBaseQuestionWordIds(
    learningLanguage,
    learningLevel,
    input?.questionCount ?? 10,
    input?.randomizeQuestions ?? true
  );

  return {
    baseQuestionWordIds,
    currentQuestionIndex: 0,
    multipleChoiceQuiz: buildQuizForQuestion(
      learningLanguage,
      learningLevel,
      baseQuestionWordIds,
      0,
      input?.randomizeQuestions ?? true
    ),
    shortAnswer: '',
    loading: false,
    wrongAttempts: 0,
    advanceReady: false,
    completed: false,
    feedback: {
      status: 'idle',
      message: '문제를 풀고 결과를 확인하세요.'
    },
    correctWordIds: [],
    reviewRound: null
  };
}

export function selectQuizOption(
  state: QuizSessionState,
  optionId: string
): QuizSessionState {
  if (state.completed || state.reviewRound) {
    return state;
  }

  return {
    ...state,
    selectedOptionId: optionId
  };
}

export function updateShortAnswerInput(
  state: QuizSessionState,
  value: string
): QuizSessionState {
  if (state.completed || state.reviewRound) {
    return state;
  }

  return {
    ...state,
    shortAnswer: value
  };
}

export function submitMultipleChoiceAnswer(
  state: QuizSessionState
): QuizSessionState {
  if (state.completed || state.reviewRound) {
    return state;
  }

  if (!state.selectedOptionId) {
    return {
      ...state,
      feedback: {
        status: 'error',
        message: '선택지를 먼저 고르세요.'
      }
    };
  }

  const isCorrect =
    state.selectedOptionId === state.multipleChoiceQuiz.answerId;

  return isCorrect
    ? markCorrect(state, '정답입니다.')
    : markWrong(
        state,
        `틀렸어요. 정답은 ${state.multipleChoiceQuiz.word.meaning}입니다.`
      );
}

export function submitShortAnswer(state: QuizSessionState): QuizSessionState {
  if (state.completed || state.reviewRound) {
    return state;
  }

  if (!state.shortAnswer.trim()) {
    return {
      ...state,
      feedback: {
        status: 'error',
        message: '정답을 입력하세요.'
      }
    };
  }

  const grade = gradeShortAnswer(
    state.shortAnswer,
    state.multipleChoiceQuiz.word.term
  );

  return {
    ...(grade.isCorrect
      ? markCorrect(state, '정답입니다.')
      : markWrong(
          state,
          `틀렸어요. 정답은 ${state.multipleChoiceQuiz.word.term}입니다.`
        )),
    shortAnswerGrade: grade
  };
}

export function enableQuizAdvance(state: QuizSessionState): QuizSessionState {
  return state;
}

export function selectReviewPrompt(
  state: QuizSessionState,
  wordId: string
): QuizSessionState {
  if (!state.reviewRound || state.reviewRound.completed) {
    return state;
  }

  if (state.reviewRound.matchedWordIds.includes(wordId)) {
    return state;
  }

  return {
    ...state,
    reviewRound: {
      ...state.reviewRound,
      selectedLeftWordId: wordId
    },
    feedback: {
      status: 'idle',
      message: '오른쪽에서 연결할 답을 고르세요.'
    }
  };
}

export function selectReviewAnswer(
  state: QuizSessionState,
  wordId: string
): QuizSessionState {
  if (!state.reviewRound || state.reviewRound.completed) {
    return state;
  }

  const selectedLeftWordId = state.reviewRound.selectedLeftWordId;

  if (!selectedLeftWordId) {
    return {
      ...state,
      feedback: {
        status: 'error',
        message: '왼쪽 블록을 먼저 고르세요.'
      }
    };
  }

  if (selectedLeftWordId !== wordId) {
    return {
      ...state,
      reviewRound: {
        ...state.reviewRound,
        selectedLeftWordId: null
      },
      feedback: {
        status: 'error',
        message: '연결이 맞지 않습니다. 다시 골라보세요.'
      }
    };
  }

  const matchedWordIds = state.reviewRound.matchedWordIds.includes(wordId)
    ? state.reviewRound.matchedWordIds
    : [...state.reviewRound.matchedWordIds, wordId];
  const completed = matchedWordIds.length === state.reviewRound.pairs.length;

  return {
    ...state,
    reviewRound: {
      ...state.reviewRound,
      matchedWordIds,
      selectedLeftWordId: null,
      completed
    },
    feedback: {
      status: 'success',
      message: completed
        ? '통합 퀴즈를 완료했습니다.'
        : '정확히 연결했습니다.'
    }
  };
}

export function finishReviewRound(state: QuizSessionState): QuizSessionState {
  if (!state.reviewRound?.completed) {
    return state;
  }

  return {
    ...state,
    reviewRound: null,
    feedback: {
      status: 'idle',
      message: '문제를 풀고 결과를 확인하세요.'
    }
  };
}

export function advanceQuizQuestion(
  state: QuizSessionState,
  input?: {
    learningLanguage?: SupportedLearningLanguage;
    learningLevel?: SupportedLearningLevel;
    randomizeQuestions?: boolean;
  }
): QuizSessionState {
  if (state.completed || state.reviewRound) {
    return state;
  }

  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const nextIndex = state.currentQuestionIndex + 1;

  if (nextIndex >= state.baseQuestionWordIds.length) {
  return {
    ...state,
      completed: true,
      feedback: {
        status: 'success',
        message: '퀴즈를 모두 완료했습니다.'
      }
    };
  }

  const shouldStartReview = nextIndex % 5 === 0;
  const currentChunkWordIds = state.baseQuestionWordIds.slice(
    nextIndex - 5,
    nextIndex
  );
  const previousCorrectWordIds = state.correctWordIds.filter(
    (wordId) => !currentChunkWordIds.includes(wordId)
  );
  const reviewRound = shouldStartReview
    ? createReviewRound(
        learningLanguage,
        learningLevel,
        currentChunkWordIds,
        previousCorrectWordIds
      )
    : null;

  const {
    selectedOptionId: _selectedOptionId,
    shortAnswerGrade: _shortAnswerGrade,
    ...rest
  } = state;

  return {
    ...rest,
    currentQuestionIndex: nextIndex,
    multipleChoiceQuiz: buildQuizForQuestion(
      learningLanguage,
      learningLevel,
      state.baseQuestionWordIds,
      nextIndex,
      input?.randomizeQuestions ?? true
    ),
    shortAnswer: '',
    loading: false,
    wrongAttempts: 0,
    advanceReady: false,
    reviewRound,
    feedback: reviewRound
      ? {
          status: 'idle',
          message: '왼쪽 블록을 고르고 오른쪽에서 뜻을 연결하세요.'
        }
      : {
          status: 'idle',
          message: '문제를 풀고 결과를 확인하세요.'
        }
  };
}
