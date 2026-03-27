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

export type QuizSessionState = {
  questionWordIds: string[];
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
};

function shuffleWordIds(words: CurriculumWord[]): string[] {
  const next = words.map((word) => word.id);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex]!;
    next[randomIndex] = current!;
  }

  return next;
}

function buildQuestionList(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  questionCount: number
) {
  const curriculum = getCurriculumByStandardLevel(
    learningLanguage,
    learningLevel
  );
  const words = curriculum.flatMap((unit) => unit.words);
  const questionWordIds = shuffleWordIds(words).slice(
    0,
    Math.max(1, Math.min(questionCount, words.length))
  );

  return {
    curriculum,
    questionWordIds
  };
}

function buildQuizForQuestion(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  questionWordIds: string[],
  index: number
): MultipleChoiceQuiz {
  return buildMultipleChoiceQuiz({
    wordId: questionWordIds[index] ?? questionWordIds[0] ?? 'hello',
    curriculum: getCurriculumByStandardLevel(learningLanguage, learningLevel)
  });
}

function markCorrect(state: QuizSessionState, message: string): QuizSessionState {
  return {
    ...state,
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
}): QuizSessionState {
  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const { questionWordIds } = buildQuestionList(
    learningLanguage,
    learningLevel,
    input?.questionCount ?? 5
  );

  return {
    questionWordIds,
    currentQuestionIndex: 0,
    multipleChoiceQuiz: buildQuizForQuestion(
      learningLanguage,
      learningLevel,
      questionWordIds,
      0
    ),
    shortAnswer: '',
    loading: false,
    wrongAttempts: 0,
    advanceReady: false,
    completed: false,
    feedback: {
      status: 'idle',
      message: '문제를 풀고 결과를 확인하세요.'
    }
  };
}

export function selectQuizOption(
  state: QuizSessionState,
  optionId: string
): QuizSessionState {
  if (state.advanceReady || state.completed) {
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
  if (state.advanceReady || state.completed) {
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
  if (state.advanceReady || state.completed) {
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
  if (state.advanceReady || state.completed) {
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
  if (state.advanceReady || state.completed) {
    return state;
  }

  return {
    ...state,
    advanceReady: true
  };
}

export function advanceQuizQuestion(
  state: QuizSessionState,
  input?: {
    learningLanguage?: SupportedLearningLanguage;
    learningLevel?: SupportedLearningLevel;
  }
): QuizSessionState {
  if (state.completed) {
    return state;
  }

  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const nextIndex = state.currentQuestionIndex + 1;

  if (nextIndex >= state.questionWordIds.length) {
    return {
      ...state,
      completed: true,
      advanceReady: false,
      feedback: {
        status: 'success',
        message: '설정한 문제를 모두 완료했습니다.'
      }
    };
  }

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
      state.questionWordIds,
      nextIndex
    ),
    shortAnswer: '',
    loading: false,
    wrongAttempts: 0,
    advanceReady: false,
    feedback: {
      status: 'idle',
      message: '문제를 풀고 결과를 확인하세요.'
    }
  };
}
