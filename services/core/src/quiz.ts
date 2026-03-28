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
  randomizeOptions?: boolean;
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

function resolveDistractorText(
  text: string,
  words: CurriculumWord[],
  targetWord: CurriculumWord
): string | null {
  const normalized = text.trim().toLowerCase();
  const matchedWord = words.find(
    (word) =>
      word.id.toLowerCase() === normalized || word.term.trim().toLowerCase() === normalized
  );

  if (matchedWord) {
    if (matchedWord.id === targetWord.id) {
      return null;
    }

    return matchedWord.meaning;
  }

  return text;
}

function shuffleOptions<T>(items: T[]): T[] {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex]!;
    next[randomIndex] = current!;
  }

  return next;
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
  const randomizeOptions = input.randomizeOptions ?? true;
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
  const jsonDistractors = (targetWord.quiz?.distractors ?? [])
    .map((text) => resolveDistractorText(text, words, targetWord))
    .filter((text): text is string => Boolean(text))
    .filter(
      (text, index, items) =>
        text.toLowerCase() !== targetWord.meaning.toLowerCase() &&
        items.findIndex((candidate) => candidate.toLowerCase() === text.toLowerCase()) ===
          index
    )
    .slice(0, Math.max(0, optionCount - 1))
    .map((text, index) => ({
      id: `${targetWord.id}-quiz-${index}`,
      text,
      isCorrect: false
    }));
  const chosenDistractors =
    jsonDistractors.length > 0
      ? jsonDistractors.slice(0, Math.max(0, optionCount - 1))
      : distractors;

  const fallbackCount = Math.max(0, optionCount - 1 - chosenDistractors.length);
  const fallbackOptions = Array.from({ length: fallbackCount }, (_, index) =>
    buildFallbackOption(targetWord, index)
  );

  const optionPool = [
    {
      id: targetWord.id,
      text: targetWord.meaning,
      isCorrect: true
    },
    ...chosenDistractors,
    ...fallbackOptions
  ];
  const options = randomizeOptions ? shuffleOptions(optionPool) : optionPool;

  return {
    word: targetWord,
    prompt: `${targetWord.term}의 뜻을 고르세요.`,
    answerId: targetWord.id,
    options
  };
}
