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

  it('switches to language-specific level systems', () => {
    const initial = createDefaultSettings({
      userId: 'user-1',
      learningLanguage: 'en',
      updatedAt: '2026-03-25T00:00:00.000Z'
    });

    const japanese = updateSettings(
      initial,
      {
        learningLanguage: 'ja'
      },
      '2026-03-26T00:00:00.000Z'
    );
    const german = updateSettings(
      japanese,
      {
        learningLanguage: 'de'
      },
      '2026-03-27T00:00:00.000Z'
    );
    const korean = updateSettings(
      german,
      {
        learningLanguage: 'ko'
      },
      '2026-03-28T00:00:00.000Z'
    );
    const chinese = updateSettings(
      korean,
      {
        learningLanguage: 'zh'
      },
      '2026-03-29T00:00:00.000Z'
    );

    expect(japanese.learningLevel).toBe('jlpt_n5');
    expect(german.learningLevel).toBe('cefr_a1');
    expect(korean.learningLevel).toBe('topik_1');
    expect(chinese.learningLevel).toBe('hsk_1');
  });
});
