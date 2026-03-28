import {
  feedCommentSchema,
  learningResultPostSchema,
  type FeedComment,
  type LearningResultPost
} from '@wordflow/shared/types';
import type { CatStage } from '@wordflow/shared/cat';

export type CreateLearningResultPostInput = {
  id: string;
  userId: string;
  body: string;
  earnedPoints: number;
  streak: number;
  createdAt: string;
  type?: LearningResultPost['type'];
  title?: string;
  userDisplayName?: string;
  eventKey?: string;
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

export type CreateStudyMilestonePostInput = {
  id: string;
  userId: string;
  createdAt: string;
  completedCount: number;
  earnedPoints: number;
  streak: number;
  eventKey?: string;
  userDisplayName?: string;
};

export type CreateStudyComebackPostInput = {
  id: string;
  userId: string;
  createdAt: string;
  daysAway: number;
  streak: number;
  eventKey?: string;
  userDisplayName?: string;
};

export type CreateCatGrowthPostInput = {
  id: string;
  userId: string;
  catName: string;
  stage: CatStage;
  activeDays: number;
  createdAt: string;
  eventKey?: string;
  userDisplayName?: string;
};

export function createLearningResultPost(
  input: CreateLearningResultPostInput
): LearningResultPost {
  return learningResultPostSchema.parse({
    id: input.id,
    userId: input.userId,
    type: input.type ?? 'learning_result',
    ...(input.userDisplayName
      ? { userDisplayName: input.userDisplayName }
      : {}),
    ...(input.title ? { title: input.title } : {}),
    body: input.body,
    earnedPoints: input.earnedPoints,
    streak: input.streak,
    ...(input.achievedSentence
      ? { achievedSentence: input.achievedSentence }
      : {}),
    ...(input.eventKey ? { eventKey: input.eventKey } : {}),
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

export function createStudyMilestonePost(
  input: CreateStudyMilestonePostInput
): LearningResultPost {
  return createLearningResultPost({
    id: input.id,
    userId: input.userId,
    type: 'study_milestone',
    title: '기록 경신',
    userDisplayName: input.userDisplayName,
    body: `오늘은 평소보다 더 많이 몰입해서 ${input.completedCount}개의 학습을 완료했고 ${input.earnedPoints}포인트를 모았어요.`,
    earnedPoints: input.earnedPoints,
    streak: input.streak,
    createdAt: input.createdAt,
    eventKey: input.eventKey
  });
}

export function createStudyComebackPost(
  input: CreateStudyComebackPostInput
): LearningResultPost {
  return createLearningResultPost({
    id: input.id,
    userId: input.userId,
    type: 'study_comeback',
    title: '다시 돌아왔어요',
    userDisplayName: input.userDisplayName,
    body: `${input.daysAway}일 만에 다시 돌아와 학습을 재개했어요. 오늘부터 다시 흐름을 이어갑니다.`,
    earnedPoints: 0,
    streak: input.streak,
    createdAt: input.createdAt,
    eventKey: input.eventKey
  });
}

function getCatStageLabel(stage: CatStage): string {
  switch (stage) {
    case 'kitten':
      return '아기 고양이';
    case 'junior':
      return '주니어 고양이';
    case 'adult':
      return '성묘';
    case 'middleAge':
      return '중년 고양이';
    case 'senior':
      return '시니어 고양이';
    case 'veteran':
      return '베테랑 고양이';
    case 'legacy':
      return '레거시 고양이';
    default:
      return '고양이';
  }
}

export function createCatGrowthPost(
  input: CreateCatGrowthPostInput
): LearningResultPost {
  return createLearningResultPost({
    id: input.id,
    userId: input.userId,
    type: 'cat_growth',
    title: '성장 업데이트',
    userDisplayName: input.userDisplayName,
    body: `${input.catName}가 ${getCatStageLabel(input.stage)} 단계로 성장했어요. 함께한 시간은 ${input.activeDays}일째입니다.`,
    earnedPoints: 0,
    streak: 0,
    createdAt: input.createdAt,
    eventKey: input.eventKey
  });
}

export function createFeedComment(input: FeedComment): FeedComment {
  return feedCommentSchema.parse(input);
}
