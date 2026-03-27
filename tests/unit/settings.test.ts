import { describe, expect, it } from 'vitest';

import {
  createDefaultSettings,
  updateSettings
} from '../../services/core/src/settings';

describe('settings domain', () => {
  it('creates default settings for a new user', () => {
    const settings = createDefaultSettings({
      userId: 'user-1',
      learningLanguage: 'en',
      updatedAt: '2026-03-25T00:00:00.000Z'
    });

    expect(settings).toEqual({
      userId: 'user-1',
      appLanguage: 'ko',
      learningLanguage: 'en',
      learningLevel: 'cefr_a1',
      sessionQuestionCount: 5,
      notificationsEnabled: true,
      premiumEnabled: false,
      updatedAt: '2026-03-25T00:00:00.000Z'
    });
  });

  it('applies partial updates without changing untouched fields', () => {
    const initial = createDefaultSettings({
      userId: 'user-1',
      learningLanguage: 'en',
      updatedAt: '2026-03-25T00:00:00.000Z'
    });

    const updated = updateSettings(
      initial,
      {
        appLanguage: 'en',
        notificationsEnabled: false,
        sessionQuestionCount: 10
      },
      '2026-03-26T00:00:00.000Z'
    );

    expect(updated.appLanguage).toBe('en');
    expect(updated.notificationsEnabled).toBe(false);
    expect(updated.learningLanguage).toBe('en');
    expect(updated.learningLevel).toBe('cefr_a1');
    expect(updated.sessionQuestionCount).toBe(10);
    expect(updated.premiumEnabled).toBe(false);
    expect(updated.updatedAt).toBe('2026-03-26T00:00:00.000Z');
  });
});
