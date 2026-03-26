import {
  type CurriculumUnit,
  type CurriculumWord
} from '@wordflow/shared/curriculum';

import { curriculumSeed } from './curriculum';

export type SentenceToken = {
  id: string;
  value: string;
  order: number;
};

export type SentenceBuilderExercise = {
  word: CurriculumWord;
  prompt: string;
  answer: string;
  tokens: SentenceToken[];
};

export type SentenceComparisonResult = {
  normalizedAnswer: string;
  normalizedSubmission: string;
  missingTokens: string[];
  extraTokens: string[];
  isCorrect: boolean;
};

export type BuildSentenceExerciseInput = {
  wordId: string;
  curriculum?: CurriculumUnit[];
};

function getCurriculumWords(units: CurriculumUnit[]): CurriculumWord[] {
  return units.flatMap((unit) => unit.words);
}

function tokenizeSentence(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}']/gu, ''))
    .filter(Boolean);
}

function normalizeSentence(sentence: string): string {
  return tokenizeSentence(sentence).join(' ').toLowerCase();
}

export function buildSentenceTokens(sentence: string): SentenceToken[] {
  return tokenizeSentence(sentence).map((value, index) => ({
    id: `${value.toLowerCase()}-${index}`,
    value,
    order: index
  }));
}

export function buildSentenceExercise(
  input: BuildSentenceExerciseInput
): SentenceBuilderExercise {
  const curriculum = input.curriculum ?? curriculumSeed;
  const words = getCurriculumWords(curriculum);
  const word = words.find((item) => item.id === input.wordId);

  if (!word) {
    throw new Error('Sentence exercise word not found.');
  }

  return {
    word,
    prompt: `${word.term}를 사용해 문장을 완성하세요.`,
    answer: word.example,
    tokens: buildSentenceTokens(word.example)
  };
}

export function compareSentenceAnswer(
  submittedTokens: string[],
  expectedSentence: string
): SentenceComparisonResult {
  const normalizedAnswer = normalizeSentence(expectedSentence);
  const normalizedSubmission = normalizeSentence(submittedTokens.join(' '));
  const expectedTokens = normalizedAnswer.split(' ').filter(Boolean);
  const actualTokens = normalizedSubmission.split(' ').filter(Boolean);

  const missingTokens = expectedTokens.filter(
    (token, index) => actualTokens[index] !== token
  );
  const extraTokens = actualTokens.filter(
    (token, index) => expectedTokens[index] !== token
  );

  return {
    normalizedAnswer,
    normalizedSubmission,
    missingTokens,
    extraTokens,
    isCorrect: normalizedAnswer === normalizedSubmission
  };
}
