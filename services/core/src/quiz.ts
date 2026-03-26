import {
  type CurriculumUnit,
  type CurriculumWord
} from '@wordflow/shared/curriculum';

import { curriculumSeed } from './curriculum';

export type MultipleChoiceOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type MultipleChoiceQuiz = {
  word: CurriculumWord;
  prompt: string;
  answerId: string;
  options: MultipleChoiceOption[];
};

export type BuildMultipleChoiceQuizInput = {
  wordId: string;
  curriculum?: CurriculumUnit[];
  optionCount?: number;
};

export type ShortAnswerGrade = {
  normalizedAnswer: string;
  normalizedExpected: string;
  distance: number;
  allowedTypos: number;
  isCorrect: boolean;
};

const DEFAULT_OPTION_COUNT = 4;

function getCurriculumWords(units: CurriculumUnit[]): CurriculumWord[] {
  return units.flatMap((unit) => unit.words);
}

function buildFallbackOption(
  word: CurriculumWord,
  index: number
): MultipleChoiceOption {
  return {
    id: `${word.id}-fallback-${index}`,
    text: `${word.meaning} (${index + 1})`,
    isCorrect: false
  };
}

export function normalizeShortAnswer(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

export function getAllowedTypos(expected: string): number {
  if (expected.length <= 4) {
    return 0;
  }

  if (expected.length <= 8) {
    return 1;
  }

  return 2;
}

export function calculateEditDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(0)
  );

  for (let row = 0; row < rows; row += 1) {
    matrix[row]![0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0]![col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = left[row - 1] === right[col - 1] ? 0 : 1;

      matrix[row]![col] = Math.min(
        matrix[row - 1]![col]! + 1,
        matrix[row]![col - 1]! + 1,
        matrix[row - 1]![col - 1]! + substitutionCost
      );
    }
  }

  return matrix[left.length]![right.length]!;
}

export function gradeShortAnswer(
  answer: string,
  expected: string
): ShortAnswerGrade {
  const normalizedAnswer = normalizeShortAnswer(answer);
  const normalizedExpected = normalizeShortAnswer(expected);
  const allowedTypos = getAllowedTypos(normalizedExpected);
  const distance = calculateEditDistance(normalizedAnswer, normalizedExpected);

  return {
    normalizedAnswer,
    normalizedExpected,
    distance,
    allowedTypos,
    isCorrect: distance <= allowedTypos
  };
}

export function buildMultipleChoiceQuiz(
  input: BuildMultipleChoiceQuizInput
): MultipleChoiceQuiz {
  const curriculum = input.curriculum ?? curriculumSeed;
  const optionCount = input.optionCount ?? DEFAULT_OPTION_COUNT;
  const words = getCurriculumWords(curriculum);
  const targetWord = words.find((word) => word.id === input.wordId);

  if (!targetWord) {
    throw new Error('Quiz target word not found.');
  }

  const distractors = words
    .filter(
      (word) =>
        word.id !== targetWord.id &&
        word.meaning.toLowerCase() !== targetWord.meaning.toLowerCase()
    )
    .filter(
      (word, index, items) =>
        items.findIndex(
          (candidate) =>
            candidate.meaning.toLowerCase() === word.meaning.toLowerCase()
        ) === index
    )
    .slice(0, Math.max(0, optionCount - 1))
    .map((word) => ({
      id: word.id,
      text: word.meaning,
      isCorrect: false
    }));

  const fallbackCount = Math.max(0, optionCount - 1 - distractors.length);
  const fallbackOptions = Array.from({ length: fallbackCount }, (_, index) =>
    buildFallbackOption(targetWord, index)
  );

  const options: MultipleChoiceOption[] = [
    {
      id: targetWord.id,
      text: targetWord.meaning,
      isCorrect: true
    },
    ...distractors,
    ...fallbackOptions
  ];

  return {
    word: targetWord,
    prompt: `${targetWord.term}의 뜻을 고르세요.`,
    answerId: targetWord.id,
    options
  };
}
