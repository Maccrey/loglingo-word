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
  updatedAt: string;
};

export type SettingsUpdate = Partial<
  Pick<
    UserSettings,
    | 'appLanguage'
    | 'learningLanguage'
    | 'learningLevel'
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
    updatedAt
  });
}
