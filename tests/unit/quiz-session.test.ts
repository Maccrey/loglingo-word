import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  advanceQuizQuestion,
  createDemoQuizSession,
  enableQuizAdvance,
  finishReviewRound,
  selectQuizOption,
  selectReviewAnswer,
  selectReviewPrompt,
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

  it('resolves english json distractors to meanings so option language stays consistent', () => {
    const initial = createDemoQuizSession({
      learningLanguage: 'en',
      learningLevel: 'cefr_a1',
      randomizeQuestions: false
    });

    expect(initial.multipleChoiceQuiz.word.term).toBe('I');
    expect(
      initial.multipleChoiceQuiz.options.map((option) => option.text)
    ).toEqual(['나', '너, 당신', '우리', '선생님']);
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

  it('starts a 6-block integrated review round after five correct answers', () => {
    let state = createDemoQuizSession({
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5',
      questionCount: 10
    });

    for (let index = 0; index < 5; index += 1) {
      state = submitMultipleChoiceAnswer(
        selectQuizOption(state, state.multipleChoiceQuiz.answerId)
      );
      state = advanceQuizQuestion(state, {
        learningLanguage: 'ja',
        learningLevel: 'jlpt_n5'
      });
    }

    expect(state.reviewRound).toBeTruthy();
    expect(state.reviewRound?.pairs.length).toBeGreaterThanOrEqual(5);

    const leftWordId = state.reviewRound!.leftWordIds[0]!;
    state = selectReviewPrompt(state, leftWordId);
    state = selectReviewAnswer(state, leftWordId);

    expect(state.reviewRound?.matchedWordIds).toContain(leftWordId);

    let next = state;
    for (const wordId of next.reviewRound!.leftWordIds.slice(1)) {
      next = selectReviewPrompt(next, wordId);
      next = selectReviewAnswer(next, wordId);
    }

    expect(next.reviewRound?.completed).toBe(true);
    expect(finishReviewRound(next).reviewRound).toBeNull();
  });
});
