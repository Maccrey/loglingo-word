import {
  createLearningResultPost,
  type CreateLearningResultPostInput
} from '@wordflow/core/social';
import type { LearningResultPost } from '@wordflow/shared/types';

function parsePositiveNumber(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseWordList(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function createSharedFeedPost(input: {
  source?: string;
  completed?: string;
  points?: string;
  leaderboard?: string;
  words?: string;
}): LearningResultPost | null {
  if (input.source !== 'recommendation') {
    return null;
  }

  const completed = parsePositiveNumber(input.completed);
  const points = parsePositiveNumber(input.points);
  const leaderboard = parsePositiveNumber(input.leaderboard);
  const words = parseWordList(input.words);

  if (completed === 0 || words.length === 0) {
    return null;
  }

  const body =
    leaderboard > 0
      ? `추천 단어 ${completed}개를 학습하고 ${points}포인트를 획득했어요. 리더보드 점수 ${leaderboard}점도 반영됐습니다. ${words.join(', ')} 복습을 마쳤습니다.`
      : `추천 단어 ${completed}개를 학습하고 ${points}포인트를 획득했어요. ${words.join(', ')} 복습을 마쳤습니다.`;

  return createLearningResultPost({
    id: 'shared-recommendation-post',
    userId: 'demo-user',
    body,
    earnedPoints: points,
    streak: 0,
    createdAt: '2026-03-26T00:00:00.000Z'
  } satisfies CreateLearningResultPostInput);
}
