import {
  getDefaultLearningLevel,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from '@wordflow/shared/learning-preferences';
import {
  getSentenceAssemblyExercisePool,
  type SentenceAssemblyBlock,
  type SentenceAssemblyDistractor,
  type SentenceAssemblyExercise,
  type SentenceAssemblyStage
} from '@wordflow/shared/sentence-expansion';
import {
  getSentenceFeedbackMessage,
  translateSentenceAdvice
} from '@wordflow/shared/sentence-feedback';
import type { SupportedAppLanguage } from '@wordflow/shared/types';

type SentenceChoice = {
  id: string;
  text: string;
  kind: 'correct' | 'distractor';
  advice?: string;
};

export type SentenceFeedback = {
  status: 'idle' | 'success' | 'error';
  message: string;
  advice?: string;
};

export type SentenceSessionState = {
  appLanguage: SupportedAppLanguage;
  exercise: SentenceAssemblyExercise;
  currentStageIndex: number;
  assembledBlocks: SentenceAssemblyBlock[];
  availableChoices: SentenceChoice[];
  randomizeChoices: boolean;
  randomizeExercise: boolean;
  completedStages: Array<{
    stageId: string;
    text: string;
  }>;
  stageCompleted: boolean;
  completed: boolean;
  feedback: SentenceFeedback;
};

function toChoiceFromBlock(block: SentenceAssemblyBlock): SentenceChoice {
  return {
    id: block.id,
    text: block.text,
    kind: 'correct'
  };
}

function toChoiceFromDistractor(
  block: SentenceAssemblyDistractor
): SentenceChoice {
  return {
    id: block.id,
    text: block.text,
    kind: 'distractor',
    advice: block.advice
  };
}

function buildChoicesForCurrentTurn(
  stage: SentenceAssemblyStage,
  assembledCount: number,
  randomizeChoices: boolean
): SentenceChoice[] {
  const nextCorrectBlock = stage.correctBlocks[assembledCount];

  if (!nextCorrectBlock) {
    return [];
  }

  const choices = [
    toChoiceFromBlock(nextCorrectBlock),
    ...stage.distractorBlocks.slice(0, 2).map(toChoiceFromDistractor)
  ].filter(
    (choice, index, items) =>
      items.findIndex((item) => item.text === choice.text) === index
  );

  if (!randomizeChoices) {
    return choices
      .map((choice, index) => ({
        choice,
        index,
        score: buildChoiceScore(stage.id, assembledCount, choice.id)
      }))
      .sort((left, right) => {
        if (left.score === right.score) {
          return left.index - right.index;
        }

        return left.score - right.score;
      })
      .map((entry) => entry.choice);
  }

  const randomizedChoices = [...choices];

  for (let index = randomizedChoices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [randomizedChoices[index], randomizedChoices[swapIndex]] = [
      randomizedChoices[swapIndex]!,
      randomizedChoices[index]!
    ];
  }

  return randomizedChoices;
}

function getExercisePool(): SentenceAssemblyExercise[] {
  return getSentenceAssemblyExercisePool();
}

function resolveSentenceExercise(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  randomizeExercise: boolean
): SentenceAssemblyExercise {
  const exercises = getExercisePool();
  const matchedExercises = getSentenceAssemblyExercisePool({
    language: learningLanguage,
    level: learningLevel
  });
  const languageExercises = getSentenceAssemblyExercisePool({
    language: learningLanguage
  });
  const candidateExercises =
    matchedExercises.length > 0
      ? matchedExercises
      : languageExercises.length > 0
        ? languageExercises
        : exercises;

  if (randomizeExercise && candidateExercises.length > 1) {
    const index = Math.floor(Math.random() * candidateExercises.length);
    return candidateExercises[index]!;
  }

  return candidateExercises[0]!;
}

function buildSelectionAdvice(
  stage: SentenceAssemblyStage,
  assembledCount: number,
  appLanguage: SupportedAppLanguage
): string {
  if (stage.correctBlocks.length - assembledCount <= 0) {
    return translateSentenceAdvice(stage.completionAdvice, appLanguage);
  }

  return translateSentenceAdvice(stage.selectionAdvice, appLanguage);
}

function buildChoiceScore(
  stageId: string,
  assembledCount: number,
  choiceId: string
): number {
  const input = `${stageId}:${assembledCount}:${choiceId}`;
  let hash = 0;

  for (const char of input) {
    hash = (hash * 33 + char.charCodeAt(0)) % 1000003;
  }

  return hash;
}

function buildInitialState(
  exercise: SentenceAssemblyExercise,
  appLanguage: SupportedAppLanguage,
  randomizeChoices: boolean,
  randomizeExercise: boolean
): SentenceSessionState {
  const firstStage = exercise.stages[0]!;

  return {
    appLanguage,
    exercise,
    currentStageIndex: 0,
    assembledBlocks: [],
    availableChoices: buildChoicesForCurrentTurn(firstStage, 0, randomizeChoices),
    randomizeChoices,
    randomizeExercise,
    completedStages: [],
    stageCompleted: false,
    completed: false,
    feedback: {
      status: 'idle',
      message: getSentenceFeedbackMessage('check_choice_first', appLanguage),
      advice: buildSelectionAdvice(firstStage, 0, appLanguage)
    }
  };
}

export function createDemoSentenceSession(input?: {
  appLanguage?: SupportedAppLanguage;
  learningLanguage?: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
  randomizeChoices?: boolean;
  randomizeExercise?: boolean;
}): SentenceSessionState {
  const appLanguage = input?.appLanguage ?? 'ko';
  const learningLanguage = input?.learningLanguage ?? 'en';
  const learningLevel =
    input?.learningLevel ?? getDefaultLearningLevel(learningLanguage);
  const randomizeChoices = input?.randomizeChoices ?? false;
  const randomizeExercise = input?.randomizeExercise ?? false;
  const exercise = resolveSentenceExercise(
    learningLanguage,
    learningLevel,
    randomizeExercise
  );

  return buildInitialState(
    exercise,
    appLanguage,
    randomizeChoices,
    randomizeExercise
  );
}

export function resetSentenceSession(
  state: SentenceSessionState
): SentenceSessionState {
  const nextExercise = state.randomizeExercise
    ? resolveSentenceExercise(
        state.exercise.language,
        state.exercise.level,
        state.randomizeExercise
      )
    : state.exercise;

  return buildInitialState(
    nextExercise,
    state.appLanguage,
    state.randomizeChoices,
    state.randomizeExercise
  );
}

export function chooseSentenceBlock(
  state: SentenceSessionState,
  choiceId: string
): SentenceSessionState {
  if (state.completed || state.stageCompleted) {
    return state;
  }

  const stage = state.exercise.stages[state.currentStageIndex];
  const choice = state.availableChoices.find((item) => item.id === choiceId);

  if (!stage || !choice) {
    return state;
  }

  const nextCorrectBlock = stage.correctBlocks[state.assembledBlocks.length];

  if (!nextCorrectBlock) {
    return state;
  }

  if (choice.kind === 'distractor') {
    return {
      ...state,
      feedback: {
        status: 'error',
        message: getSentenceFeedbackMessage('wrong_block', state.appLanguage, {
          block: choice.text
        }),
        advice: translateSentenceAdvice(
          choice.advice ?? stage.selectionAdvice,
          state.appLanguage
        )
      }
    };
  }

  const nextAssembledBlocks = [...state.assembledBlocks, nextCorrectBlock];
  const stageCompleted = nextAssembledBlocks.length === stage.correctBlocks.length;

  return {
    ...state,
    assembledBlocks: nextAssembledBlocks,
    availableChoices: stageCompleted
      ? []
      : buildChoicesForCurrentTurn(
          stage,
          nextAssembledBlocks.length,
          state.randomizeChoices
        ),
    stageCompleted,
    feedback: {
      status: 'success',
      message: stageCompleted
        ? getSentenceFeedbackMessage('stage_completed', state.appLanguage)
        : getSentenceFeedbackMessage('correct_block', state.appLanguage, {
            block: choice.text
          }),
      ...(stageCompleted
        ? {
            advice: translateSentenceAdvice(
              stage.completionAdvice,
              state.appLanguage
            )
          }
        : {
            advice: buildSelectionAdvice(
              stage,
              nextAssembledBlocks.length,
              state.appLanguage
            )
          })
    }
  };
}

export function moveToNextSentenceStage(
  state: SentenceSessionState
): SentenceSessionState {
  if (!state.stageCompleted || state.completed) {
    return state;
  }

  const stage = state.exercise.stages[state.currentStageIndex];
  const nextStageIndex = state.currentStageIndex + 1;
  const nextStage = state.exercise.stages[nextStageIndex];
  const completedStages = stage
    ? [
        ...state.completedStages,
        {
          stageId: stage.id,
          text: stage.correctBlocks.map((block) => block.text).join(' ')
        }
      ]
    : state.completedStages;

  if (!nextStage) {
    return {
      ...state,
      completedStages,
      completed: true,
      stageCompleted: true,
      feedback: {
        status: 'success',
        message: getSentenceFeedbackMessage('all_completed', state.appLanguage)
      }
    };
  }

  return {
    ...state,
    currentStageIndex: nextStageIndex,
    assembledBlocks: [],
    availableChoices: buildChoicesForCurrentTurn(
      nextStage,
      0,
      state.randomizeChoices
    ),
    completedStages,
    stageCompleted: false,
    feedback: {
      status: 'idle',
      message: getSentenceFeedbackMessage(
        'check_next_sentence',
        state.appLanguage
      ),
      advice: buildSelectionAdvice(nextStage, 0, state.appLanguage)
    }
  };
}
