import { type EnvThresholds, getCatThresholds } from '../cat/engine';

export interface CareOutcomeSummary {
  feedCount: number;
  playCount: number;
  washCount: number;
  remainingPoints: number;
}

/**
 * T5-1. 학습 완료 후 고양이 경제 요약 함수 구현
 * 학습으로 획득한 포인트를 바탕으로 각 돌봄 액션을 최대 몇 번 할 수 있는지 요약합니다.
 */
export function summarizeStudyToCareOutcome(
  earnedPoints: number,
  env: Partial<EnvThresholds> = {}
): CareOutcomeSummary {
  const thresholds = getCatThresholds(env);
  
  return {
    feedCount: Math.floor(earnedPoints / thresholds.CAT_COST_FEED),
    playCount: Math.floor(earnedPoints / thresholds.CAT_COST_PLAY),
    washCount: Math.floor(earnedPoints / thresholds.CAT_COST_WASH),
    remainingPoints: earnedPoints,
  };
}

/**
 * T5-2. 일일 학습 안전 판정 함수 구현
 * 획득한 포인트가 하루 최소 필수 돌봄(먹이 1회 + 놀기 1회) 비용을 충족하는지 반환합니다.
 */
export function isDailyStudyEnoughForCatCare(
  dailyEarnedPoints: number,
  env: Partial<EnvThresholds> = {}
): boolean {
  const thresholds = getCatThresholds(env);
  const safeTarget = thresholds.CAT_COST_FEED + thresholds.CAT_COST_PLAY;
  return dailyEarnedPoints >= safeTarget;
}
