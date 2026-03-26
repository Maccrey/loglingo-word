import { describe, expect, it } from 'vitest';

import {
  createAssistantChatMessage,
  createUserChatMessage
} from '../../services/ai/src/chat';
import { buildConversationPrompt } from '../../services/ai/src/prompt';

describe('conversation prompt builder', () => {
  it('reflects the learner language settings', () => {
    const prompt = buildConversationPrompt({
      nativeLanguage: 'ko',
      targetLanguage: 'en',
      userLevel: 'beginner',
      recentMessages: []
    });

    expect(prompt).toContain('Native language: ko');
    expect(prompt).toContain('Target language: en');
    expect(prompt).toContain('Learner level: beginner');
    expect(prompt).toContain('Reply primarily in en');
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
      ]
    });

    expect(prompt).toContain('[user] I go to station yesterday.');
    expect(prompt).toContain(
      '[assistant] A more natural sentence is: I went to the station yesterday.'
    );
  });
});
