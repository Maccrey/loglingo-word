import {
  curriculumUnitSchema,
  type CurriculumUnit
} from '@wordflow/shared/curriculum';
import cefrA1Units from '@wordflow/shared/data/en/cefr-a1.json';
import jlptN5Units from '@wordflow/shared/data/ja/jlpt-n5.json';
import topik1Units from '@wordflow/shared/data/ko/topik-1.json';
import hsk1Units from '@wordflow/shared/data/zh/hsk-1.json';
import {
  type SupportedLearningLanguage,
  type SupportedLearningLevel,
  isLearningLevelSupportedForLanguage
} from '@wordflow/shared/learning-preferences';

const cefrA1Seed: CurriculumUnit[] = cefrA1Units.map((unit) =>
  curriculumUnitSchema.parse(unit)
);

const jlptN5Seed: CurriculumUnit[] = jlptN5Units.map((unit) =>
  curriculumUnitSchema.parse(unit)
);

const topik1Seed: CurriculumUnit[] = topik1Units.map((unit) =>
  curriculumUnitSchema.parse(unit)
);

const hsk1Seed: CurriculumUnit[] = hsk1Units.map((unit) =>
  curriculumUnitSchema.parse(unit)
);

export const curriculumSeed: CurriculumUnit[] = [
  ...cefrA1Seed,
  {
    id: 'travel-checkin',
    language: 'en',
    standardLevel: 'cefr_a2',
    level: 2,
    order: 1,
    title: '여행 체크인',
    words: [
      {
        id: 'reservation',
        term: 'reservation',
        meaning: '예약',
        example: 'I have a reservation under Kim.'
      },
      {
        id: 'passport',
        term: 'passport',
        meaning: '여권',
        example: 'Please show me your passport.'
      }
    ]
  },
  ...jlptN5Seed,
  {
    id: 'japanese-travel',
    language: 'ja',
    standardLevel: 'jlpt_n4',
    level: 2,
    order: 1,
    title: '일본 여행 표현',
    words: [
      {
        id: 'yoyaku',
        term: '予約',
        meaning: '예약',
        example: '予約を確認してください。'
      },
      {
        id: 'ekimae',
        term: '駅前',
        meaning: '역 앞',
        example: '駅前で会いましょう。'
      }
    ]
  },
  ...topik1Seed,
  ...hsk1Seed
];

export function getCurriculumUnits(): CurriculumUnit[] {
  return [...curriculumSeed]
    .map((unit) => curriculumUnitSchema.parse(unit))
    .sort((left, right) => {
      if (left.language !== right.language) {
        return left.language.localeCompare(right.language);
      }

      if (left.level === right.level) {
        return left.order - right.order;
      }

      return left.level - right.level;
    });
}

export function getCurriculumByLevel(level: number): CurriculumUnit[] {
  return getCurriculumUnits().filter((unit) => unit.level === level);
}

export function getCurriculumByStandardLevel(
  language: SupportedLearningLanguage,
  standardLevel: SupportedLearningLevel
): CurriculumUnit[] {
  if (!isLearningLevelSupportedForLanguage(language, standardLevel)) {
    return [];
  }

  return getCurriculumUnits().filter(
    (unit) =>
      unit.language === language && unit.standardLevel === standardLevel
  );
}
