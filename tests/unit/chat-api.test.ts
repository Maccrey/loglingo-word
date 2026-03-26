import { describe, expect, it } from 'vitest';

import {
  FirestoreAIChatRepository,
  InMemoryAIChatRepository,
  handleAIChat,
  type AIChatMessageDocumentStore
} from '../../services/ai/src/api';
import {
  createAssistantChatMessage,
  type AIChatMessage
} from '../../services/ai/src/chat';

describe('ai chat api service', () => {
  it('validates the request DTO', async () => {
    const repository = new InMemoryAIChatRepository();

    await expect(
      handleAIChat(
        {
          userId: 'user-1',
          nativeLanguage: 'ko',
          targetLanguage: '',
          userLevel: 'beginner',
          message: 'hello',
          createdAt: '2026-03-26T00:00:00.000Z'
        },
        {
          repository,
          client: {
            async complete() {
              return {
                assistantMessage: 'Hello there.',
                correctionRaw:
                  '{"corrected":"Hello there.","feedback":"인사를 조금 더 자연스럽게 다듬었습니다."}'
              };
            }
          }
        }
      )
    ).rejects.toThrow();
  });

  it('maps a successful completion into stored chat messages', async () => {
    const repository = new InMemoryAIChatRepository();

    const result = await handleAIChat(
      {
        userId: 'user-1',
        nativeLanguage: 'ko',
        targetLanguage: 'en',
        userLevel: 'beginner',
        message: 'i go station yesterday',
        createdAt: '2026-03-26T00:00:00.000Z',
        recentMessages: [
          createAssistantChatMessage({
            userId: 'user-1',
            message: 'What did you do yesterday?',
            createdAt: '2026-03-25T23:59:00.000Z'
          })
        ]
      },
      {
        repository,
        client: {
          async complete() {
            return {
              assistantMessage:
                'A natural sentence is: I went to the station yesterday.',
              correctionRaw:
                '{"corrected":"I went to the station yesterday.","feedback":"과거 시제와 정관사를 보완하세요."}'
            };
          }
        }
      }
    );

    expect(result.messages.map((message) => message.role)).toEqual([
      'user',
      'assistant',
      'correction'
    ]);
    expect(result.messages[2]).toMatchObject({
      corrected: 'I went to the station yesterday.',
      feedback: '과거 시제와 정관사를 보완하세요.'
    });
    expect(result.prompt).toContain('[assistant] What did you do yesterday?');
    await expect(repository.listByUserId('user-1')).resolves.toHaveLength(3);
  });

  it('returns a stable error when the openai request fails', async () => {
    const repository = new InMemoryAIChatRepository();

    await expect(
      handleAIChat(
        {
          userId: 'user-1',
          nativeLanguage: 'ko',
          targetLanguage: 'en',
          userLevel: 'intermediate',
          message: 'Can you fix this sentence?',
          createdAt: '2026-03-26T00:00:00.000Z',
          recentMessages: []
        },
        {
          repository,
          client: {
            async complete() {
              throw new Error('network failed');
            }
          }
        }
      )
    ).rejects.toThrow('AI 채팅 응답 생성에 실패했습니다.');

    await expect(repository.listByUserId('user-1')).resolves.toHaveLength(1);
  });

  it('persists chat messages through the firestore-backed repository adapter', async () => {
    const messagesByUser = new Map<string, AIChatMessage[]>();
    const store: AIChatMessageDocumentStore = {
      async addMany(messages) {
        for (const message of messages) {
          const current = messagesByUser.get(message.userId) ?? [];
          messagesByUser.set(message.userId, [...current, message]);
        }
      },
      async listByUserId(userId) {
        return messagesByUser.get(userId) ?? [];
      }
    };
    const repository = new FirestoreAIChatRepository(store);

    await handleAIChat(
      {
        userId: 'user-1',
        nativeLanguage: 'ko',
        targetLanguage: 'en',
        userLevel: 'beginner',
        message: 'i am happy',
        createdAt: '2026-03-26T00:00:00.000Z',
        recentMessages: []
      },
      {
        repository,
        client: {
          async complete() {
            return {
              assistantMessage: 'That sounds great.',
              correctionRaw:
                '{"corrected":"I am happy.","feedback":"문장 첫 글자를 대문자로 시작하세요."}'
            };
          }
        }
      }
    );

    await expect(repository.listByUserId('user-1')).resolves.toHaveLength(3);
  });
});
