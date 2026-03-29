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
      'de-cefr-a1-people',
      'de-cefr-a1-time',
      'de-cefr-a1-places',
      'de-cefr-a1-actions',
      'de-cefr-a1-objects',
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
      'japanese-travel',
      'topik-1-greetings',
      'topik-1-people',
      'topik-1-time-place',
      'topik-1-food',
      'topik-1-actions',
      'hsk-1-people',
      'hsk-1-time',
      'hsk-1-places',
      'hsk-1-actions',
      'hsk-1-objects'
    ]);
  });

  it('filters curriculum units by level', () => {
    const levelOneUnits = getCurriculumByLevel(1);

    expect(levelOneUnits).toHaveLength(25);
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

  it('returns imported german cefr a1 units', () => {
    const germanStarter = getCurriculumByStandardLevel('de', 'cefr_a1');

    expect(germanStarter.map((unit) => unit.id)).toEqual([
      'de-cefr-a1-people',
      'de-cefr-a1-time',
      'de-cefr-a1-places',
      'de-cefr-a1-actions',
      'de-cefr-a1-objects'
    ]);
    expect(germanStarter[0]?.words[0]?.term).toBe('Ich');
    expect(germanStarter[0]?.words[0]?.reading).toBeUndefined();
    expect(germanStarter[1]?.words[3]?.writing?.prompt).toBe(
      '아침에 맞는 독일어를 쓰세요.'
    );
  });

  it('includes writing metadata in imported jlpt n5 words', () => {
    const japaneseStarter = getCurriculumByStandardLevel('ja', 'jlpt_n5');
    const firstWord = japaneseStarter[0]?.words[0];

    expect(firstWord?.reading).toBe('こんにちは');
    expect(firstWord?.writing?.answer).toBe('こんにちは');
    expect(firstWord?.writing?.accepted).toContain('こんにちは');
  });

  it('returns imported korean topik 1 units', () => {
    const koreanStarter = getCurriculumByStandardLevel('ko', 'topik_1');

    expect(koreanStarter.map((unit) => unit.id)).toEqual([
      'topik-1-greetings',
      'topik-1-people',
      'topik-1-time-place',
      'topik-1-food',
      'topik-1-actions'
    ]);
    expect(koreanStarter[0]?.words[0]?.reading).toBe('annyeonghaseyo');
    expect(koreanStarter[0]?.words[0]?.writing?.answer).toBe('안녕하세요');
  });

  it('returns imported chinese hsk 1 units', () => {
    const chineseStarter = getCurriculumByStandardLevel('zh', 'hsk_1');

    expect(chineseStarter.map((unit) => unit.id)).toEqual([
      'hsk-1-people',
      'hsk-1-time',
      'hsk-1-places',
      'hsk-1-actions',
      'hsk-1-objects'
    ]);
    expect(chineseStarter[0]?.words[0]?.reading).toBe('wǒ');
    expect(chineseStarter[0]?.words[0]?.writing?.answer).toBe('我');
  });
});
