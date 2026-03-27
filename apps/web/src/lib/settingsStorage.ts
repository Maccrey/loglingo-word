'use client';

import {
  userSettingsSchema,
  type UserSettings
} from '@wordflow/shared/types';
import {
  getDefaultLearningLevel,
  type SupportedLearningLanguage,
  isLearningLevelSupportedForLanguage
} from '@wordflow/shared/learning-preferences';
import { createDefaultSettings, updateSettings } from '@wordflow/core/settings';

const USER_SETTINGS_KEY = 'mock_user_settings';
export const USER_SETTINGS_UPDATED_EVENT = 'user-settings-updated';

function notifySettingsUpdated() {
  window.dispatchEvent(new CustomEvent(USER_SETTINGS_UPDATED_EVENT));
}

export function createFallbackSettings(): UserSettings {
  return createDefaultSettings({
    userId: 'demo-user',
    learningLanguage: 'en',
    sessionQuestionCount: 5,
    updatedAt: '2026-03-26T00:00:00.000Z'
  });
}

function migrateStoredSettings(raw: unknown): UserSettings {
  const parsed = userSettingsSchema.safeParse(raw);

  if (parsed.success) {
    return parsed.data;
  }

  const base = createFallbackSettings();

  if (!raw || typeof raw !== 'object') {
    return base;
  }

  const candidate = raw as Partial<UserSettings> & {
    learningLanguage?: string;
    learningLevel?: string;
    sessionQuestionCount?: number;
  };
  const learningLanguage = candidate.learningLanguage === 'ja' ? 'ja' : 'en';
  const learningLevel =
    candidate.learningLevel &&
    isLearningLevelSupportedForLanguage(learningLanguage, candidate.learningLevel)
      ? candidate.learningLevel
      : getDefaultLearningLevel(learningLanguage);

  return updateSettings(
    {
      ...base,
      ...(candidate.userId ? { userId: candidate.userId } : {}),
      ...(candidate.appLanguage === 'en' ? { appLanguage: 'en' } : {}),
      ...(candidate.notificationsEnabled !== undefined
        ? { notificationsEnabled: candidate.notificationsEnabled }
        : {}),
      ...(candidate.sessionQuestionCount !== undefined
        ? { sessionQuestionCount: candidate.sessionQuestionCount }
        : {}),
      ...(candidate.premiumEnabled !== undefined
        ? { premiumEnabled: candidate.premiumEnabled }
        : {})
    },
    {
      learningLanguage,
      learningLevel
    },
    candidate.updatedAt ?? base.updatedAt
  );
}

export function loadStoredSettings(): UserSettings | null {
  const stored = window.localStorage.getItem(USER_SETTINGS_KEY);

  if (!stored) {
    return null;
  }

  try {
    return migrateStoredSettings(JSON.parse(stored));
  } catch {
    return createFallbackSettings();
  }
}

export function saveStoredSettings(settings: UserSettings) {
  window.localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings));
  notifySettingsUpdated();
}

export function readStoredSettingsSnapshot(): UserSettings {
  if (typeof window === 'undefined') {
    return createFallbackSettings();
  }

  return loadStoredSettings() ?? createFallbackSettings();
}
