import { describe, expect, it } from 'vitest';
import {
  cefrA1SentenceAssemblyExercises,
  getSentenceAssemblyExercisePool,
  jlptN5SentenceAssemblyExercises,
  topik1SentenceAssemblyExercises
} from '@wordflow/shared/sentence-expansion';

import {
  chooseSentenceBlock,
  createDemoSentenceSession,
  moveToNextSentenceStage,
  resetSentenceSession
} from '../../apps/web/src/app/sentence/sentenceSession';

describe('sentence session state', () => {
  it('loads 200 jlpt n5 sentence exercises from json data', () => {
    expect(jlptN5SentenceAssemblyExercises).toHaveLength(200);
  });

  it('loads 200 cefr a1 sentence exercises from json data', () => {
    expect(cefrA1SentenceAssemblyExercises).toHaveLength(200);
  });

  it('loads 200 topik 1 sentence exercises from json data', () => {
    expect(topik1SentenceAssemblyExercises).toHaveLength(200);
  });

  it('returns sentence exercise pools by language and level', () => {
    expect(
      getSentenceAssemblyExercisePool({ language: 'en', level: 'cefr_a1' })
    ).toHaveLength(200);
    expect(
      getSentenceAssemblyExercisePool({ language: 'ja', level: 'jlpt_n5' })
    ).toHaveLength(200);
    expect(
      getSentenceAssemblyExercisePool({ language: 'ko', level: 'topik_1' })
    ).toHaveLength(200);
    expect(getSentenceAssemblyExercisePool({ language: 'en' }).length).toBeGreaterThan(0);
  });

  it('keeps every choice set unique so the same option is not shown twice', () => {
    for (const exercise of jlptN5SentenceAssemblyExercises) {
      for (const stage of exercise.stages) {
        for (let index = 0; index < stage.correctBlocks.length; index += 1) {
          const texts = [
            stage.correctBlocks[index]!.text,
            ...stage.distractorBlocks.slice(0, 2).map((item) => item.text)
          ];

          expect(new Set(texts).size).toBe(texts.length);
        }
      }
    }
  });

  it('shows exactly three candidate blocks for the current turn', () => {
    const initial = createDemoSentenceSession({
      appLanguage: 'ko',
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });

    expect(initial.currentStageIndex).toBe(0);
    expect(initial.availableChoices).toHaveLength(3);
    expect(initial.availableChoices.map((choice) => choice.text)).toContain('私は');
    expect(initial.availableChoices.map((choice) => choice.text)).toContain('学校に');
    expect(initial.availableChoices.map((choice) => choice.text)).toContain('行きたいです。');
    expect(initial.feedback.advice).toContain('주어와 동사부터 고르세요.');
  });

  it('returns an english exercise when learning language is english', () => {
    const initial = createDemoSentenceSession({
      appLanguage: 'ko',
      learningLanguage: 'en',
      learningLevel: 'cefr_a1'
    });

    expect(initial.exercise.language).toBe('en');
    expect(initial.exercise.level).toBe('cefr_a1');
    expect(initial.availableChoices.map((choice) => choice.text)).toContain('I');
    expect(initial.availableChoices.map((choice) => choice.text)).toContain('to school');
  });

  it('keeps english sentence goals in english word order', () => {
    const firstObjectExercise = cefrA1SentenceAssemblyExercises.find((exercise) =>
      exercise.id.startsWith('cefr-a1-object-')
    );

    expect(firstObjectExercise?.stages[1]?.goal).toBe('I drink water.');
    expect(firstObjectExercise?.stages[1]?.correctBlocks.map((block) => block.text)).toEqual([
      'I',
      'drink',
      'water.'
    ]);
    expect(firstObjectExercise?.stages[3]?.goal).toBe(
      'I want to drink water today.'
    );
  });

  it('puts english time expressions at the end when the sentence pattern requires it', () => {
    const exercise = cefrA1SentenceAssemblyExercises.find(
      (item) => item.id === 'cefr-a1-object-093'
    );
    const stage = exercise?.stages[2];

    expect(stage?.goal).toBe('I drink water every day.');
    expect(stage?.correctBlocks.map((block) => block.text)).toEqual([
      'I',
      'drink',
      'water.',
      'every day'
    ]);
    expect(stage?.goalTranslations.ko.text).toBe('매일 나는 물을 마신다.');
    expect(stage?.goalTranslations.ko.segmentBlockIndexes).toEqual([3, 0, 2, 1]);
  });

  it('renders japanese learning sentences as natural english target sentences', () => {
    const exercise = jlptN5SentenceAssemblyExercises.find(
      (item) => item.id === 'jlpt-n5-travel-023'
    );
    const stage = exercise?.stages[1];

    expect(stage?.goalTranslations.en.text).toBe('My friend goes to school.');
    expect(stage?.goalTranslations.en.segmentBlockIndexes).toEqual([0, 2, 1]);
  });

  it('keeps japanese source time blocks without topic particles', () => {
    const badStages = jlptN5SentenceAssemblyExercises.flatMap((exercise) =>
      exercise.stages.filter((stage) =>
        stage.correctBlocks.some((block) =>
          ['今日は', '明日は', '昨日は', '朝は', '夜は', '今は'].includes(block.text)
        )
      )
    );

    expect(badStages).toHaveLength(0);
  });

  it('keeps korean goal translations in natural object and place order', () => {
    const badStages = [
      ...cefrA1SentenceAssemblyExercises,
      ...jlptN5SentenceAssemblyExercises
    ].flatMap((exercise) =>
      exercise.stages.filter((stage) =>
        /\.학교에|\.역에|\.집에|\.가게에|\.물을|\.차를|\.밥을|\.빵을|\.이름을/.test(
          stage.goalTranslations.ko.text
        )
      )
    );

    expect(badStages).toHaveLength(0);
  });

  it('keeps chinese target sentences in natural verb order', () => {
    const badStages = [
      ...cefrA1SentenceAssemblyExercises,
      ...jlptN5SentenceAssemblyExercises
    ].flatMap((exercise) =>
      exercise.stages.filter((stage) =>
        /去学校去。|去车站去。|去商店去。|回家去。|我水喝。|我茶喝。|我米饭吃。|我面包吃。|我书读。|我名字写。/.test(
          stage.goalTranslations.zh.text
        )
      )
    );

    expect(badStages).toHaveLength(0);
  });

  it('builds the sentence one correct block at a time', () => {
    let state = createDemoSentenceSession({
      appLanguage: 'ko',
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });

    const firstChoice = state.availableChoices.find((choice) => choice.text === '私は');
    state = chooseSentenceBlock(state, firstChoice!.id);
    expect(state.assembledBlocks.map((block) => block.text)).toEqual(['私は']);
    expect(state.availableChoices).toHaveLength(3);

    const secondChoice = state.availableChoices.find(
      (choice) => choice.text === '行きます。'
    );
    state = chooseSentenceBlock(state, secondChoice!.id);

    expect(state.feedback.status).toBe('success');
    expect(state.stageCompleted).toBe(true);
    expect(state.assembledBlocks.map((block) => block.text)).toEqual([
      '私は',
      '行きます。'
    ]);
  });

  it('returns advice when a distractor block is selected', () => {
    const initial = createDemoSentenceSession({
      appLanguage: 'ko',
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });
    const distractor = initial.availableChoices.find(
      (choice) => choice.text === '学校に'
    );
    const next = chooseSentenceBlock(initial, distractor!.id);

    expect(next.feedback.status).toBe('error');
    expect(next.feedback.advice).toContain('장소는 아직 아닙니다.');
  });

  it('moves to the next problem after a stage is completed', () => {
    let state = createDemoSentenceSession({
      appLanguage: 'ko',
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });

    state = chooseSentenceBlock(
      state,
      state.availableChoices.find((choice) => choice.text === '私は')!.id
    );
    state = chooseSentenceBlock(
      state,
      state.availableChoices.find((choice) => choice.text === '行きます。')!.id
    );
    state = moveToNextSentenceStage(state);

    expect(state.currentStageIndex).toBe(1);
    expect(state.completedStages[0]?.text).toBe('私は 行きます。');
    expect(state.availableChoices).toHaveLength(3);
    expect(state.availableChoices.map((choice) => choice.text)).toContain('私は');
  });

  it('resets the full training back to the first problem', () => {
    let state = createDemoSentenceSession({
      appLanguage: 'ko',
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });

    state = chooseSentenceBlock(
      state,
      state.availableChoices.find((choice) => choice.text === '私は')!.id
    );
    state = resetSentenceSession(state);

    expect(state.currentStageIndex).toBe(0);
    expect(state.assembledBlocks).toEqual([]);
    expect(state.completedStages).toEqual([]);
  });

  it('shows advice and feedback in the selected app language', () => {
    const initial = createDemoSentenceSession({
      appLanguage: 'en',
      learningLanguage: 'ja',
      learningLevel: 'jlpt_n5'
    });
    const distractor = initial.availableChoices.find(
      (choice) => choice.text === '学校に'
    );
    const next = chooseSentenceBlock(initial, distractor!.id);

    expect(initial.feedback.message).toBe('Check which block should come next.');
    expect(initial.feedback.advice).toBe('Start with the subject and verb.');
    expect(next.feedback.message).toContain('does not fit this sentence');
    expect(next.feedback.advice).toBe('The place comes later.');
  });
});
