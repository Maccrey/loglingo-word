import {
  getDefaultLearningLevel,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from '@wordflow/shared/learning-preferences';
import {
  jlptN5SentenceAssemblyExercises,
  type SentenceAssemblyBlock,
  type SentenceAssemblyDistractor,
  type SentenceAssemblyExercise,
  type SentenceAssemblyStage
} from '@wordflow/shared/sentence-expansion';

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
  ];

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
  return [...jlptN5SentenceAssemblyExercises];
}

function resolveSentenceExercise(
  learningLanguage: SupportedLearningLanguage,
  learningLevel: SupportedLearningLevel,
  randomizeExercise: boolean
): SentenceAssemblyExercise {
  const exercises = getExercisePool();
  const matchedExercises =
    exercises.filter(
      (exercise) =>
        exercise.language === learningLanguage && exercise.level === learningLevel
    ) ??
    [];
  const languageExercises = exercises.filter(
    (exercise) => exercise.language === learningLanguage
  );
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
  assembledCount: number
): string {
  if (stage.correctBlocks.length - assembledCount <= 0) {
    return stage.completionAdvice;
  }

  return stage.selectionAdvice;
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
  randomizeChoices: boolean,
  randomizeExercise: boolean
): SentenceSessionState {
  const firstStage = exercise.stages[0]!;

  return {
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
      message: '어떤 블록을 골라야 하는지 먼저 확인하세요.',
      advice: buildSelectionAdvice(firstStage, 0)
    }
  };
}

export function createDemoSentenceSession(input?: {
  learningLanguage?: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
  randomizeChoices?: boolean;
  randomizeExercise?: boolean;
}): SentenceSessionState {
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

  return buildInitialState(exercise, randomizeChoices, randomizeExercise);
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
        message: `${choice.text} 블록은 이 문장에 맞지 않습니다.`,
        advice: choice.advice ?? stage.selectionAdvice
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
        ? `${stage.title} 문장을 완성했습니다.`
        : `${choice.text} 블록이 맞습니다.`,
      ...(stageCompleted
        ? {
            advice: stage.completionAdvice
          }
        : {
            advice: buildSelectionAdvice(stage, nextAssembledBlocks.length)
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
        message: '모든 문자조립훈련 문제를 완료했습니다.'
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
      message: '다음 문장에서 어떤 블록이 먼저 필요한지 확인하세요.',
      advice: buildSelectionAdvice(nextStage, 0)
    }
  };
}
