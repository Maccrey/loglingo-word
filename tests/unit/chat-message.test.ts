import { describe, expect, it } from 'vitest';

import {
  createAssistantChatMessage,
  createCorrectionChatMessage,
  createUserChatMessage,
  mapCorrectionPayload
} from '../../services/ai/src/chat';

describe('chat message model', () => {
  it('creates user and assistant messages with the correct roles', () => {
    const userMessage = createUserChatMessage({
      userId: 'user-1',
      message: 'i go airport tomorrow',
      createdAt: '2026-03-26T00:00:00.000Z'
    });
    const assistantMessage = createAssistantChatMessage({
      userId: 'user-1',
      message: 'You can say: I am going to the airport tomorrow.',
      createdAt: '2026-03-26T00:00:01.000Z'
    });

    expect(userMessage.role).toBe('user');
    expect(assistantMessage.role).toBe('assistant');
  });

  it('maps corrected and feedback fields into a correction payload', () => {
    const payload = mapCorrectionPayload({
      userId: 'user-1',
      message: 'i go airport tomorrow',
      corrected: 'I am going to the airport tomorrow.',
      feedback: '동사 시제와 관사를 보완하세요.',
      createdAt: '2026-03-26T00:00:00.000Z'
    });

    expect(payload).toEqual({
      corrected: 'I am going to the airport tomorrow.',
      feedback: '동사 시제와 관사를 보완하세요.'
    });
  });

  it('creates correction messages with optional correction metadata', () => {
    const message = createCorrectionChatMessage({
      userId: 'user-1',
      message: "Let's refine that sentence.",
      corrected: 'I am going to the airport tomorrow.',
      feedback: '현재진행형과 정관사를 함께 쓰면 더 자연스럽습니다.',
      createdAt: '2026-03-26T00:00:02.000Z'
    });

    expect(message.role).toBe('correction');
    expect(message.corrected).toBe('I am going to the airport tomorrow.');
    expect(message.feedback).toBe(
      '현재진행형과 정관사를 함께 쓰면 더 자연스럽습니다.'
    );
  });
});
