import { canPairLanguages, isSupportedLanguage } from "@wordflow/shared/languages";

export type OnboardingStep = "language" | "goal" | "start" | "complete";

export type LearningGoal =
  | "daily_habit"
  | "travel"
  | "business"
  | "conversation";

export type OnboardingState = {
  nativeLanguage?: string;
  targetLanguage?: string;
  goal?: LearningGoal;
  startedAt?: string;
};

const onboardingStepOrder: OnboardingStep[] = [
  "language",
  "goal",
  "start",
  "complete"
];

export function getOnboardingStepIndex(step: OnboardingStep): number {
  return onboardingStepOrder.indexOf(step);
}

export function canAdvanceFromLanguage(state: OnboardingState): boolean {
  return Boolean(
    state.nativeLanguage &&
      state.targetLanguage &&
      canPairLanguages(state.nativeLanguage, state.targetLanguage)
  );
}

export function canAdvanceFromGoal(state: OnboardingState): boolean {
  return canAdvanceFromLanguage(state) && Boolean(state.goal);
}

export function canAdvanceFromStart(state: OnboardingState): boolean {
  return canAdvanceFromGoal(state) && Boolean(state.startedAt);
}

export function getNextOnboardingStep(state: OnboardingState): OnboardingStep {
  if (!canAdvanceFromLanguage(state)) {
    return "language";
  }

  if (!canAdvanceFromGoal(state)) {
    return "goal";
  }

  if (!canAdvanceFromStart(state)) {
    return "start";
  }

  return "complete";
}

export function updateLanguages(
  state: OnboardingState,
  nativeLanguage: string,
  targetLanguage: string
): OnboardingState {
  if (!isSupportedLanguage(nativeLanguage) || !isSupportedLanguage(targetLanguage)) {
    throw new Error("Unsupported language selected.");
  }

  if (nativeLanguage === targetLanguage) {
    throw new Error("Native and target language must differ.");
  }

  return {
    ...state,
    nativeLanguage,
    targetLanguage
  };
}

export function updateGoal(
  state: OnboardingState,
  goal: LearningGoal
): OnboardingState {
  if (!canAdvanceFromLanguage(state)) {
    throw new Error("Language step must be completed first.");
  }

  return {
    ...state,
    goal
  };
}

export function markFirstLessonStarted(
  state: OnboardingState,
  startedAt: string
): OnboardingState {
  if (!canAdvanceFromGoal(state)) {
    throw new Error("Goal step must be completed first.");
  }

  return {
    ...state,
    startedAt
  };
}

