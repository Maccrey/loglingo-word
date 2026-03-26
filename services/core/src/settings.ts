import { userSettingsSchema, type UserSettings } from '@wordflow/shared/types';

export type CreateDefaultSettingsInput = {
  userId: string;
  learningLanguage: string;
  updatedAt: string;
};

export type SettingsUpdate = Partial<
  Pick<
    UserSettings,
    | 'appLanguage'
    | 'learningLanguage'
    | 'notificationsEnabled'
    | 'premiumEnabled'
  >
>;

export function createDefaultSettings(
  input: CreateDefaultSettingsInput
): UserSettings {
  return userSettingsSchema.parse({
    userId: input.userId,
    appLanguage: 'ko',
    learningLanguage: input.learningLanguage,
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
  return userSettingsSchema.parse({
    ...settings,
    ...patch,
    updatedAt
  });
}
