import { NextResponse } from 'next/server';

import {
  FirestoreAIChatRepository,
  InMemoryAIChatRepository,
  aiChatRequestSchema,
  handleAIChat
} from '@wordflow/ai/api';

import {
  createFirestoreAIChatStore,
  hasFirebaseAdminConfig
} from '../../../lib/firebase-admin';

// HIGH-RISK-UNREVIEWED: OpenAI API 키 처리 포함 — 서버 사이드 전용
import { createCompletionClient } from '@wordflow/ai/openai-client';

const repository = hasFirebaseAdminConfig()
  ? new FirestoreAIChatRepository(createFirestoreAIChatStore())
  : new InMemoryAIChatRepository();

// OPENAI_API_KEY 있으면 실제 GPT-4o, 없으면 mock fallback
const completionClient = createCompletionClient();

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = aiChatRequestSchema.parse(json);
    const result = await handleAIChat(input, {
      repository,
      client: completionClient
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
