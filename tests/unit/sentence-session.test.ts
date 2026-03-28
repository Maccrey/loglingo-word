import { describe, expect, it } from 'vitest';
import { jlptN5SentenceAssemblyExercises } from '@wordflow/shared/sentence-expansion';

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

  it('builds the sentence one correct block at a time', () => {
    let state = createDemoSentenceSession({
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
});
