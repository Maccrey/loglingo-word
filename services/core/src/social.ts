import {
  learningResultPostSchema,
  type LearningResultPost
} from '@wordflow/shared/types';

export type CreateLearningResultPostInput = {
  id: string;
  userId: string;
  body: string;
  earnedPoints: number;
  streak: number;
  createdAt: string;
  achievedSentence?: string;
};

export type AutoLearningResultPostInput = {
  id: string;
  userId: string;
  createdAt: string;
  earnedPoints?: number;
  streak?: number;
  achievedSentence?: string;
};

export function createLearningResultPost(
  input: CreateLearningResultPostInput
): LearningResultPost {
  return learningResultPostSchema.parse({
    id: input.id,
    userId: input.userId,
    type: 'learning_result',
    body: input.body,
    earnedPoints: input.earnedPoints,
    streak: input.streak,
    ...(input.achievedSentence
      ? { achievedSentence: input.achievedSentence }
      : {}),
    likeCount: 0,
    shareCount: 0,
    likedByUser: false,
    createdAt: input.createdAt
  });
}

export function buildLearningResultPostBody(
  input: Pick<
    AutoLearningResultPostInput,
    'earnedPoints' | 'streak' | 'achievedSentence'
  >
): string {
  if (input.earnedPoints && input.streak && input.achievedSentence) {
    return `연속 ${input.streak}일 학습을 이어가며 ${input.earnedPoints}포인트를 획득했고, "${input.achievedSentence}" 문장까지 완성했어요.`;
  }

  if (input.earnedPoints && input.streak) {
    return `오늘 ${input.earnedPoints}포인트를 획득하며 ${input.streak}일 연속 학습을 이어갔어요.`;
  }

  if (input.achievedSentence) {
    return `오늘은 "${input.achievedSentence}" 문장을 완성했어요.`;
  }

  return '오늘도 학습을 이어가며 한 걸음 더 나아갔어요.';
}

export function createAutoLearningResultPost(
  input: AutoLearningResultPostInput
): LearningResultPost {
  return createLearningResultPost({
    id: input.id,
    userId: input.userId,
    body: buildLearningResultPostBody(input),
    earnedPoints: input.earnedPoints ?? 0,
    streak: input.streak ?? 0,
    createdAt: input.createdAt,
    ...(input.achievedSentence
      ? { achievedSentence: input.achievedSentence }
      : {})
  });
}
