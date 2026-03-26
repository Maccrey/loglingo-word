import { describe, expect, it } from 'vitest';

import en from '../../locales/en.json';
import ko from '../../locales/ko.json';

function sortedKeys(object: Record<string, string>): string[] {
  return Object.keys(object).sort();
}

describe('locale resources', () => {
  it('keeps the same translation keys in ko and en', () => {
    expect(sortedKeys(ko)).toEqual(sortedKeys(en));
  });
});
