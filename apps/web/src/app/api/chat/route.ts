import { NextResponse } from 'next/server';

import {
  FirestoreAIChatRepository,
  InMemoryAIChatRepository,
  aiChatRequestSchema,
  handleAIChat,
  type AIChatCompletionClient
} from '@wordflow/ai/api';

import {
  createFirestoreAIChatStore,
  hasFirebaseAdminConfig
} from '../../../lib/firebase-admin';

const repository = hasFirebaseAdminConfig()
  ? new FirestoreAIChatRepository(createFirestoreAIChatStore())
  : new InMemoryAIChatRepository();

const mockCompletionClient: AIChatCompletionClient = {
  async complete(input) {
    return {
      assistantMessage: `Let's improve this in ${input.targetLanguage}: ${input.userMessage}`,
      correctionRaw: JSON.stringify({
        corrected: input.userMessage,
        feedback: '문장을 조금 더 자연스럽게 다듬어 보세요.'
      })
    };
  }
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = aiChatRequestSchema.parse(json);
    const result = await handleAIChat(input, {
      repository,
      client: mockCompletionClient
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'AI 채팅 요청 처리에 실패했습니다.';
    const status =
      error instanceof Error && message !== 'AI 채팅 응답 생성에 실패했습니다.'
        ? 400
        : 502;

    return NextResponse.json({ message }, { status });
  }
}
