import { describe, expect, it } from 'vitest';

import {
  canPairLanguages,
  isSupportedLanguage,
  supportedLanguages
} from '../../packages/shared/src/languages';

describe('languages', () => {
  it('returns the supported language list', () => {
    expect(supportedLanguages.length).toBeGreaterThanOrEqual(4);
    expect(supportedLanguages.map((language) => language.code)).toContain('ko');
  });

  it('blocks identical native and target language pairs', () => {
    expect(canPairLanguages('ko', 'ko')).toBe(false);
  });

  it('accepts valid language pairs', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(canPairLanguages('ko', 'en')).toBe(true);
  });
});
