import { describe, expect, it } from 'vitest';

import {
  getCurriculumByStandardLevel,
  getCurriculumByLevel,
  getCurriculumUnits
} from '../../services/core/src/curriculum';

describe('curriculum', () => {
  it('sorts curriculum units by level and order', () => {
    const units = getCurriculumUnits();

    expect(units.map((unit) => unit.id)).toEqual([
      'cefr-a1-people',
      'cefr-a1-time',
      'cefr-a1-places',
      'cefr-a1-actions',
      'travel-checkin',
      'japanese-greetings',
      'japanese-people',
      'japanese-time',
      'japanese-places',
      'japanese-food',
      'japanese-actions',
      'japanese-travel'
    ]);
  });

  it('filters curriculum units by level', () => {
    const levelOneUnits = getCurriculumByLevel(1);

    expect(levelOneUnits).toHaveLength(10);
    expect(levelOneUnits.every((unit) => unit.level === 1)).toBe(true);
  });

  it('filters curriculum units by language and standard level', () => {
    const japaneseStarter = getCurriculumByStandardLevel('ja', 'jlpt_n5');

    expect(japaneseStarter.map((unit) => unit.id)).toEqual([
      'japanese-greetings',
      'japanese-people',
      'japanese-time',
      'japanese-places',
      'japanese-food',
      'japanese-actions'
    ]);
  });

  it('returns imported english cefr a1 units', () => {
    const englishStarter = getCurriculumByStandardLevel('en', 'cefr_a1');

    expect(englishStarter.map((unit) => unit.id)).toEqual([
      'cefr-a1-people',
      'cefr-a1-time',
      'cefr-a1-places',
      'cefr-a1-actions'
    ]);
    expect(englishStarter[0]?.words[0]?.term).toBe('I');
  });

  it('includes writing metadata in imported jlpt n5 words', () => {
    const japaneseStarter = getCurriculumByStandardLevel('ja', 'jlpt_n5');
    const firstWord = japaneseStarter[0]?.words[0];

    expect(firstWord?.reading).toBe('こんにちは');
    expect(firstWord?.writing?.answer).toBe('こんにちは');
    expect(firstWord?.writing?.accepted).toContain('こんにちは');
  });
});
