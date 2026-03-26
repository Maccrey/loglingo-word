import { describe, expect, it } from 'vitest';

import {
  buildMultipleChoiceQuiz,
  gradeShortAnswer
} from '../../services/core/src/quiz';

describe('multiple choice quiz generator', () => {
  it('includes the correct answer in the options', () => {
    const quiz = buildMultipleChoiceQuiz({
      wordId: 'hello'
    });

    expect(quiz.answerId).toBe('hello');
    expect(
      quiz.options.some((option) => option.id === 'hello' && option.isCorrect)
    ).toBe(true);
  });

  it('removes duplicate distractor meanings', () => {
    const quiz = buildMultipleChoiceQuiz({
      wordId: 'hello',
      curriculum: [
        {
          id: 'custom',
          level: 1,
          order: 1,
          title: 'custom',
          words: [
            {
              id: 'hello',
              term: 'hello',
              meaning: '안녕하세요',
              example: 'Hello.'
            },
            {
              id: 'hi',
              term: 'hi',
              meaning: '안녕하세요',
              example: 'Hi.'
            },
            {
              id: 'thanks',
              term: 'thanks',
              meaning: '고마워요',
              example: 'Thanks.'
            },
            {
              id: 'subway',
              term: 'subway',
              meaning: '지하철',
              example: 'Subway.'
            }
          ]
        }
      ],
      optionCount: 4
    });

    const uniqueTexts = new Set(quiz.options.map((option) => option.text));
    expect(uniqueTexts.size).toBe(quiz.options.length);
  });

  it('fills missing options with fallback choices when there are not enough distractors', () => {
    const quiz = buildMultipleChoiceQuiz({
      wordId: 'hello',
      curriculum: [
        {
          id: 'tiny',
          level: 1,
          order: 1,
          title: 'tiny',
          words: [
            {
              id: 'hello',
              term: 'hello',
              meaning: '안녕하세요',
              example: 'Hello.'
            },
            {
              id: 'thanks',
              term: 'thanks',
              meaning: '고마워요',
              example: 'Thanks.'
            }
          ]
        }
      ],
      optionCount: 4
    });

    expect(quiz.options).toHaveLength(4);
    expect(
      quiz.options.filter((option) => option.id.includes('fallback'))
    ).toHaveLength(2);
  });
});

describe('short answer grading', () => {
  it('ignores whitespace when grading typed answers', () => {
    const result = gradeShortAnswer(' pass port ', 'passport');

    expect(result.normalizedAnswer).toBe('passport');
    expect(result.isCorrect).toBe(true);
  });

  it('ignores casing differences', () => {
    const result = gradeShortAnswer('HeLLo', 'hello');

    expect(result.normalizedExpected).toBe('hello');
    expect(result.isCorrect).toBe(true);
  });

  it('marks an answer wrong when the typo distance exceeds the allowed threshold', () => {
    const result = gradeShortAnswer('psspt', 'passport');

    expect(result.allowedTypos).toBe(1);
    expect(result.distance).toBeGreaterThan(result.allowedTypos);
    expect(result.isCorrect).toBe(false);
  });
});
