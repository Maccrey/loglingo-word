import { describe, expect, it } from 'vitest';

import {
  createAssistantChatMessage,
  createUserChatMessage
} from '../../services/ai/src/chat';
import { buildConversationPrompt } from '../../services/ai/src/prompt';

describe('conversation prompt builder', () => {
  it('reflects the learner language settings and persona', () => {
    const prompt = buildConversationPrompt({
      nativeLanguage: 'ko',
      targetLanguage: 'en',
      userLevel: 'beginner',
      recentMessages: [],
      aiFriendGender: 'female',
      aiFriendName: 'Emily'
    });

    expect(prompt).toContain(' Emily, 영어 회화 전문 코치야.');
    expect(prompt).toContain('학습자의 모국어는 "한국어"이고, 배우려는 언어는 "영어"이야.');
    expect(prompt).toContain('입문자 수준 — 매우 짧고 쉬운 단어와 기초 문장만 사용한다.');
    expect(prompt).toContain('1단계: 오늘의 필수 단어 및 입력 가이드 (Pre-study)');
  });

  it('optimizes learning continuity using progress summary', () => {
    const summary = '이미 1단계를 완료하고 카페 주문 단어를 학습함. 현재 2단계.';
    const prompt = buildConversationPrompt({
      nativeLanguage: 'ko',
      targetLanguage: 'ja',
      userLevel: 'intermediate',
      recentMessages: [],
      aiFriendGender: 'male',
      aiFriendName: 'Ren',
      learningProgressSummary: summary
    });

    expect(prompt).toContain('### [이전 학습 요약 및 현재 상태]');
    expect(prompt).toContain(summary);
    expect(prompt).toContain('이미 완료된 단계는 건너뛰고, 다음 단계부터 자연스럽게 대화를 이어가줘.');
  });

  it('includes recent conversation context', () => {
    const prompt = buildConversationPrompt({
      nativeLanguage: 'ko',
      targetLanguage: 'en',
      userLevel: 'intermediate',
      recentMessages: [
        createUserChatMessage({
          userId: 'user-1',
          message: 'I go to station yesterday.',
          createdAt: '2026-03-26T00:00:00.000Z'
        }),
        createAssistantChatMessage({
          userId: 'user-1',
          message:
            'A more natural sentence is: I went to the station yesterday.',
          createdAt: '2026-03-26T00:00:01.000Z'
        })
      ],
      aiFriendGender: 'female',
      aiFriendName: 'Emily'
    });

    expect(prompt).toContain('[user] I go to station yesterday.');
    expect(prompt).toContain(
      '[assistant] A more natural sentence is: I went to the station yesterday.'
    );
  });
});
