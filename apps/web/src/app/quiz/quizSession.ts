import {
  buildMultipleChoiceQuiz,
  gradeShortAnswer,
  type MultipleChoiceQuiz,
  type ShortAnswerGrade
} from '@wordflow/core/quiz';

export type QuizFeedback = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export type QuizSessionState = {
  multipleChoiceQuiz: MultipleChoiceQuiz;
  selectedOptionId?: string;
  shortAnswer: string;
  shortAnswerGrade?: ShortAnswerGrade;
  loading: boolean;
  feedback: QuizFeedback;
};

export function createDemoQuizSession(): QuizSessionState {
  return {
    multipleChoiceQuiz: buildMultipleChoiceQuiz({
      wordId: 'passport'
    }),
    shortAnswer: '',
    loading: false,
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
  return {
    ...state,
    selectedOptionId: optionId
  };
}

export function updateShortAnswerInput(
  state: QuizSessionState,
  value: string
): QuizSessionState {
  return {
    ...state,
    shortAnswer: value
  };
}

export function submitMultipleChoiceAnswer(
  state: QuizSessionState
): QuizSessionState {
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

  return {
    ...state,
    feedback: {
      status: isCorrect ? 'success' : 'error',
      message: isCorrect
        ? '객관식 정답입니다.'
        : `객관식 오답입니다. 정답은 ${state.multipleChoiceQuiz.word.meaning}입니다.`
    }
  };
}

export function submitShortAnswer(state: QuizSessionState): QuizSessionState {
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
    ...state,
    shortAnswerGrade: grade,
    feedback: {
      status: grade.isCorrect ? 'success' : 'error',
      message: grade.isCorrect
        ? '주관식 정답입니다.'
        : `주관식 오답입니다. 정답은 ${state.multipleChoiceQuiz.word.term}입니다.`
    }
  };
}
