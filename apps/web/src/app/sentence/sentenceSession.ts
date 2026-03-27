import {
  buildSentenceExercise,
  compareSentenceAnswer,
  type SentenceComparisonResult,
  type SentenceToken
} from '@wordflow/core/sentence';
import { getCurriculumByStandardLevel } from '@wordflow/core/curriculum';
import {
  getDefaultLearningLevel,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from '@wordflow/shared/learning-preferences';

export type SentenceFeedback = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export type SentenceSessionState = {
  exercise: ReturnType<typeof buildSentenceExercise>;
  poolTokens: SentenceToken[];
  assembledTokens: SentenceToken[];
  result?: SentenceComparisonResult;
  feedback: SentenceFeedback;
};

export function createDemoSentenceSession(input?: {
  learningLanguage?: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
}): SentenceSessionState {
  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const curriculum = getCurriculumByStandardLevel(
    learningLanguage,
    learningLevel
  );
  const targetWord = curriculum[0]?.words[0];
  const exercise = buildSentenceExercise({
    wordId: targetWord?.id ?? 'hello',
    curriculum
  });

  return {
    exercise,
    poolTokens: [...exercise.tokens],
    assembledTokens: [],
    feedback: {
      status: 'idle',
      message: '토큰을 순서대로 조합해 문장을 완성하세요.'
    }
  };
}

export function moveTokenToAnswer(
  state: SentenceSessionState,
  tokenId: string
): SentenceSessionState {
  const token = state.poolTokens.find((item) => item.id === tokenId);

  if (!token) {
    return state;
  }

  return {
    ...state,
    poolTokens: state.poolTokens.filter((item) => item.id !== tokenId),
    assembledTokens: [...state.assembledTokens, token]
  };
}

export function moveTokenBackToPool(
  state: SentenceSessionState,
  tokenId: string
): SentenceSessionState {
  const token = state.assembledTokens.find((item) => item.id === tokenId);

  if (!token) {
    return state;
  }

  return {
    ...state,
    poolTokens: [...state.poolTokens, token],
    assembledTokens: state.assembledTokens.filter((item) => item.id !== tokenId)
  };
}

export function resetSentenceSession(
  state: SentenceSessionState
): SentenceSessionState {
  const { result: _result, ...rest } = state;

  return {
    ...rest,
    poolTokens: [...state.exercise.tokens],
    assembledTokens: [],
    feedback: {
      status: 'idle',
      message: '토큰을 순서대로 조합해 문장을 완성하세요.'
    }
  };
}

export function submitSentenceSession(
  state: SentenceSessionState
): SentenceSessionState {
  const result = compareSentenceAnswer(
    state.assembledTokens.map((token) => token.value),
    state.exercise.answer
  );

  return {
    ...state,
    result,
    feedback: {
      status: result.isCorrect ? 'success' : 'error',
      message: result.isCorrect
        ? '문장 완성 정답입니다.'
        : '문장 순서를 다시 확인하세요.'
    }
  };
}
