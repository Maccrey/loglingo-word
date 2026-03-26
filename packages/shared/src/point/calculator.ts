import type { AppEnv } from '../env';

export interface LearningActivity {
  isFirstStudyOfDay?: boolean;
  studyDurationMinutes?: number;
  wordsMemorized?: number;
  reviewsCompleted?: number;
  sentencesPracticed?: number;
  gptConversations?: number;
}

/**
 * 학습 결과를 바탕으로 획득할 포인트를 계산합니다.
 */
export function calculateLearningPoints(
  env: AppEnv,
  activity: LearningActivity
): number {
  let totalPoints = 0;

  // 1. 일일 학습 시작 보상 (환경변수에 명시적 값이 없다면 100을 기본값으로 하거나 생략 가능)
  if (activity.isFirstStudyOfDay) {
    totalPoints += 100; // Hardcoded default as PRD didn't specify a dedicated var yet
  }

  // 2. 15분 학습 보상 (15분마다 base 보상 지급)
  if (activity.studyDurationMinutes && activity.studyDurationMinutes >= 15) {
    const chunksOf15Mins = Math.floor(activity.studyDurationMinutes / 15);
    totalPoints += chunksOf15Mins * env.POINTS_LEARNING_BASE;
  }

  // 3. 외운 단어 수 보상
  if (activity.wordsMemorized && activity.wordsMemorized > 0) {
    totalPoints += activity.wordsMemorized * env.POINTS_WORDS;
  }

  // 4. 복습 완료 보상
  if (activity.reviewsCompleted && activity.reviewsCompleted > 0) {
    totalPoints += activity.reviewsCompleted * env.POINTS_REVIEW;
  }

  // 5. 문장 학습 보상
  if (activity.sentencesPracticed && activity.sentencesPracticed > 0) {
    totalPoints += activity.sentencesPracticed * env.POINTS_SENTENCES;
  }

  // 6. AI 대화 보상
  if (activity.gptConversations && activity.gptConversations > 0) {
    totalPoints += activity.gptConversations * env.POINTS_GPT_CONVERSATION;
  }

  return totalPoints;
}

/**
 * 일일 포인트 획득 상한선을 적용합니다.
 */
export function applyDailyPointCaps(
  earnedToday: number,
  newPoints: number,
  dailyMax: number = 5000
): number {
  if (earnedToday >= dailyMax) {
    return 0; // Already hit max
  }
  const remainingSpace = dailyMax - earnedToday;
  return Math.min(newPoints, remainingSpace);
}

/**
 * 중복 이벤트 보상 방지 필터
 * 과거 이력(history)에 같은 이벤트 ID가 존재하면 보상을 제외합니다.
 */
export function dedupeLearningReward(
  recentEventIds: string[],
  currentEventId: string
): boolean {
  return !recentEventIds.includes(currentEventId);
}
