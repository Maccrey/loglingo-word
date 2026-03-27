import { userSettingsSchema, type UserSettings } from '@wordflow/shared/types';
import {
  getDefaultLearningLevel,
  isLearningLevelSupportedForLanguage,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from '@wordflow/shared/learning-preferences';

export type CreateDefaultSettingsInput = {
  userId: string;
  learningLanguage: SupportedLearningLanguage;
  learningLevel?: SupportedLearningLevel;
  sessionQuestionCount?: number;
  updatedAt: string;
};

export type SettingsUpdate = Partial<
  Pick<
    UserSettings,
    | 'appLanguage'
    | 'learningLanguage'
    | 'learningLevel'
    | 'sessionQuestionCount'
    | 'notificationsEnabled'
    | 'premiumEnabled'
  >
>;

function resolveLearningLevel(
  learningLanguage: SupportedLearningLanguage,
  learningLevel?: SupportedLearningLevel
): SupportedLearningLevel {
  if (
    learningLevel &&
    isLearningLevelSupportedForLanguage(learningLanguage, learningLevel)
  ) {
    return learningLevel;
  }

  return getDefaultLearningLevel(learningLanguage);
}

function resolveSessionQuestionCount(value?: number): number {
  if (!value || !Number.isFinite(value)) {
    return 5;
  }

  return Math.min(50, Math.max(1, Math.floor(value)));
}

export function createDefaultSettings(
  input: CreateDefaultSettingsInput
): UserSettings {
  return userSettingsSchema.parse({
    userId: input.userId,
    appLanguage: 'ko',
    learningLanguage: input.learningLanguage,
    learningLevel: resolveLearningLevel(
      input.learningLanguage,
      input.learningLevel
    ),
    sessionQuestionCount: resolveSessionQuestionCount(
      input.sessionQuestionCount
    ),
    notificationsEnabled: true,
    premiumEnabled: false,
    updatedAt: input.updatedAt
  });
}

export function updateSettings(
  settings: UserSettings,
  patch: SettingsUpdate,
  updatedAt: string
): UserSettings {
  const learningLanguage = patch.learningLanguage ?? settings.learningLanguage;

  return userSettingsSchema.parse({
    ...settings,
    ...patch,
    learningLanguage,
    learningLevel: resolveLearningLevel(learningLanguage, patch.learningLevel),
    sessionQuestionCount: resolveSessionQuestionCount(
      patch.sessionQuestionCount ?? settings.sessionQuestionCount
    ),
    updatedAt
  });
}
