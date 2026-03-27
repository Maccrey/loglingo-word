import {
  curriculumUnitSchema,
  type CurriculumUnit
} from '@wordflow/shared/curriculum';
import jlptN5Units from '@wordflow/shared/data/jlpt-n5.json';
import {
  type SupportedLearningLanguage,
  type SupportedLearningLevel,
  isLearningLevelSupportedForLanguage
} from '@wordflow/shared/learning-preferences';

const jlptN5Seed: CurriculumUnit[] = jlptN5Units.map((unit) =>
  curriculumUnitSchema.parse(unit)
);

export const curriculumSeed: CurriculumUnit[] = [
  {
    id: 'starter-basics',
    language: 'en',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 1,
    title: '기초 인사',
    words: [
      {
        id: 'hello',
        term: 'hello',
        meaning: '안녕하세요',
        example: 'Hello, nice to meet you.'
      },
      {
        id: 'thanks',
        term: 'thanks',
        meaning: '고마워요',
        example: 'Thanks for your help.'
      }
    ]
  },
  {
    id: 'starter-routine',
    language: 'en',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 2,
    title: '일상 표현',
    words: [
      {
        id: 'breakfast',
        term: 'breakfast',
        meaning: '아침 식사',
        example: 'I eat breakfast at seven.'
      },
      {
        id: 'subway',
        term: 'subway',
        meaning: '지하철',
        example: 'I take the subway to work.'
      }
    ]
  },
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
  }
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
