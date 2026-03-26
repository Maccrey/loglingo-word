import { NextResponse } from 'next/server';

import {
  FirestoreAIRecommendationRepository,
  InMemoryAIRecommendationRepository
} from '@wordflow/ai/recommendation';
import {
  aiRecommendationRequestSchema,
  handleAIRecommendation
} from '@wordflow/ai/recommendation';

import {
  createFirestoreAIRecommendationStore,
  hasFirebaseAdminConfig
} from '../../../lib/firebase-admin';

const repository = hasFirebaseAdminConfig()
  ? new FirestoreAIRecommendationRepository(
      createFirestoreAIRecommendationStore()
    )
  : new InMemoryAIRecommendationRepository();

const mockRecommendationClient = {
  async complete(input: {
    fallbackWords: string[];
  }): Promise<{ rawResponse: string }> {
    return {
      rawResponse: JSON.stringify({
        words: input.fallbackWords.slice(0, 3)
      })
    };
  }
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = aiRecommendationRequestSchema.parse(json);
    const result = await handleAIRecommendation(input, {
      repository,
      client: mockRecommendationClient
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'AI 추천 요청 처리에 실패했습니다.';
    const status = message === '이번 주 추천은 이미 요청했습니다.' ? 409 : 400;

    return NextResponse.json({ message }, { status });
  }
}
