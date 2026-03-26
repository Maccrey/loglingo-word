import {
  calculateLearningPoints,
  applyDailyPointCaps,
  dedupeLearningReward,
  type LearningActivity
} from '../../../packages/shared/src/point';
import { createPointLedgerEntry } from './point';
import type { PointLedger } from '../../../packages/shared/src/cat/types';
import type { AppEnv } from '../../../packages/shared/src/env';

export interface PointIntegrationResult {
  success: boolean;
  reason?: 'duplicate_event' | 'no_points_earned' | 'daily_cap_reached';
  grantedPoints?: number;
  entry?: PointLedger;
}

/**
 * T5-3. 학습 로그와 포인트 서비스 연동
 * 단위 학습, 복습, AI 회화 등 학습 이벤트를 받아 포인트를 계산하고, 
 * 중복 검증 및 일일 캡을 적용항 후 고양이 육성용 포인트 데이터(PointLedger)로 변환합니다.
 */
export function processLearningEventToCatPoints(
  userId: string,
  eventId: string,
  activity: LearningActivity,
  env: AppEnv,
  recentEventIds: string[] = [],
  earnedToday: number = 0,
  dailyMax: number = 5000
): PointIntegrationResult {
  // 1. 중복 보상 방지
  if (!dedupeLearningReward(recentEventIds, eventId)) {
    return { success: false, reason: 'duplicate_event' };
  }

  // 2. 획득 포인트 계산 (순수 학습 보상)
  const rawPoints = calculateLearningPoints(env, activity);
  if (rawPoints <= 0) {
    return { success: false, reason: 'no_points_earned' };
  }

  // 3. 상한 캡 적용
  const grantedPoints = applyDailyPointCaps(earnedToday, rawPoints, dailyMax);
  if (grantedPoints <= 0) {
    return { success: false, reason: 'daily_cap_reached' };
  }

  // 4. 렛저 생성
  const entry = createPointLedgerEntry(userId, grantedPoints, 'learning_reward');

  return {
    success: true,
    grantedPoints,
    entry,
  };
}
