import { describe, expect, it } from 'vitest';

import {
  createDemoQuizSession,
  selectQuizOption,
  submitMultipleChoiceAnswer,
  submitShortAnswer,
  updateShortAnswerInput
} from '../../apps/web/src/app/quiz/quizSession';

describe('quiz session state', () => {
  it('marks the multiple choice answer correct when the right option is selected', () => {
    const initial = createDemoQuizSession();
    const selected = selectQuizOption(
      initial,
      initial.multipleChoiceQuiz.answerId
    );
    const submitted = submitMultipleChoiceAnswer(selected);

    expect(submitted.feedback.status).toBe('success');
    expect(submitted.feedback.message).toContain('객관식 정답');
  });

  it('grades a typed short answer and stores the grade', () => {
    const initial = createDemoQuizSession();
    const typed = updateShortAnswerInput(initial, 'passport');
    const submitted = submitShortAnswer(typed);

    expect(submitted.shortAnswerGrade?.isCorrect).toBe(true);
    expect(submitted.feedback.status).toBe('success');
  });
});
