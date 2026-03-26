import {
  curriculumUnitSchema,
  type CurriculumUnit
} from '@wordflow/shared/curriculum';

export const curriculumSeed: CurriculumUnit[] = [
  {
    id: 'starter-basics',
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
  }
];

export function getCurriculumUnits(): CurriculumUnit[] {
  return [...curriculumSeed]
    .map((unit) => curriculumUnitSchema.parse(unit))
    .sort((left, right) => {
      if (left.level === right.level) {
        return left.order - right.order;
      }

      return left.level - right.level;
    });
}

export function getCurriculumByLevel(level: number): CurriculumUnit[] {
  return getCurriculumUnits().filter((unit) => unit.level === level);
}
