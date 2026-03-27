import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  advanceQuizQuestion,
  createDemoQuizSession,
  enableQuizAdvance,
  selectQuizOption,
  submitMultipleChoiceAnswer,
  submitShortAnswer,
  updateShortAnswerInput
} from '../../apps/web/src/app/quiz/quizSession';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(Math, 'random').mockReturnValue(0.999);
});

describe('quiz session state', () => {
  it('marks the multiple choice answer correct when the right option is selected', () => {
    const initial = createDemoQuizSession();
    const selected = selectQuizOption(
      initial,
      initial.multipleChoiceQuiz.answerId
    );
    const submitted = submitMultipleChoiceAnswer(selected);

    expect(submitted.feedback.status).toBe('success');
    expect(submitted.feedback.message).toContain('정답');
  });

  it('grades a typed short answer and stores the grade', () => {
    const initial = createDemoQuizSession({
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });
    const typed = updateShortAnswerInput(initial, 'こんにちは');
    const submitted = submitShortAnswer(typed);

    expect(submitted.shortAnswerGrade?.isCorrect).toBe(true);
    expect(submitted.feedback.status).toBe('success');
  });

  it('uses json distractors and shuffles the options', () => {
    const initial = createDemoQuizSession({
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });

    expect(initial.multipleChoiceQuiz.options).toHaveLength(4);
    expect(
      initial.multipleChoiceQuiz.options.map((option) => option.text).sort()
    ).toEqual(['고마워요', '실례합니다', '안녕하세요', '안녕히 가세요'].sort());
  });

  it('moves to the next question after a correct answer is acknowledged', () => {
    const initial = createDemoQuizSession({
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5',
      questionCount: 3
    });
    const selected = selectQuizOption(
      initial,
      initial.multipleChoiceQuiz.answerId
    );
    const submitted = submitMultipleChoiceAnswer(selected);
    const ready = enableQuizAdvance(submitted);
    const advanced = advanceQuizQuestion(ready, {
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });

    expect(advanced.currentQuestionIndex).toBe(1);
    expect(advanced.feedback.status).toBe('idle');
  });

  it('tracks a second wrong answer so the client can move on', () => {
    const initial = createDemoQuizSession({
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5',
      questionCount: 3
    });
    const firstWrong = submitShortAnswer(
      updateShortAnswerInput(initial, '틀린답')
    );
    const secondWrong = submitShortAnswer(
      updateShortAnswerInput(firstWrong, '또틀림')
    );

    expect(firstWrong.feedback.message).toContain('천천히 생각해보세요');
    expect(secondWrong.wrongAttempts).toBe(2);
    expect(secondWrong.feedback.message).toContain('정답은');
  });
});
