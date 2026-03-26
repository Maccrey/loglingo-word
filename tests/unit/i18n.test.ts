import { describe, expect, it } from 'vitest';

import en from '../../locales/en.json';
import ko from '../../locales/ko.json';
import { translate } from '../../packages/shared/src/i18n';

describe('locale fallback', () => {
  it('returns the locale translation when it exists', () => {
    expect(
      translate({
        key: 'home.title',
        localeMessages: ko,
        fallbackMessages: en
      })
    ).toBe('오늘의 학습 흐름');
  });

  it('returns the fallback translation when the locale key is missing', () => {
    expect(
      translate({
        key: 'home.title',
        localeMessages: {},
        fallbackMessages: en
      })
    ).toBe("Today's Learning Flow");
  });

  it('returns the key itself when both locale and fallback are missing', () => {
    expect(
      translate({
        key: 'missing.key',
        localeMessages: {},
        fallbackMessages: {}
      })
    ).toBe('missing.key');
  });
});
