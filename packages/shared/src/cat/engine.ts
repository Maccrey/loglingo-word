import type { Cat, CatStage, CatStatus } from './types';

export interface CatStateSnapshot {
  status: CatStatus;
  stage: CatStage;
  severityStatus: 'healthy' | 'sick' | 'critical' | 'dead';
  stressStatus: 'healthy' | 'stressed' | 'warning' | 'sick';
  isHungry: boolean;
  isSmelly: boolean;
  isStressed: boolean;
  isStressWarning: boolean;
  shouldDie: boolean;
}

export interface EnvThresholds {
  CAT_HUNGRY_HOURS: number;
  CAT_SMELLY_HOURS: number;
  CAT_STRESSED_HOURS: number;
  CAT_STRESS_AFTER_PLAY_MISS_HOURS: number;
  CAT_STRESS_WARNING_LIMIT_HOURS: number;
  CAT_SICK_AFTER_NO_PLAY_HOURS: number;
  CAT_SICK_AFTER_SMELLY_HOURS: number;
  CAT_DEATH_AFTER_NO_FEED_DAYS: number;
  CAT_SICK_HOURS: number;
  CAT_CRITICAL_HOURS: number;
  CAT_DEAD_DAYS: number;
  CAT_STAGE_JUNIOR_DAYS: number;
  CAT_STAGE_ADULT_DAYS: number;
  CAT_STAGE_MIDDLE_AGE_DAYS: number;
  CAT_STAGE_SENIOR_DAYS: number;
  CAT_STAGE_VETERAN_DAYS: number;
  CAT_STAGE_LEGACY_DAYS: number;
  CAT_COST_FEED: number;
  CAT_COST_WASH: number;
  CAT_COST_PLAY: number;
  CAT_COST_HEAL: number;
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function getLastCareAt(cat: Cat): number {
  return Math.max(cat.lastFedAt, cat.lastWashedAt, cat.lastPlayedAt);
}

export function getTreatmentRequiredAt(
  cat: Cat,
  currentTime: number,
  thresholds: EnvThresholds
): number | undefined {
  if (cat.treatmentRequiredAt) {
    return cat.treatmentRequiredAt;
  }

  const inferredTreatmentRequiredAt = getLastCareAt(cat) + MS_PER_DAY;

  if (currentTime >= inferredTreatmentRequiredAt) {
    return inferredTreatmentRequiredAt;
  }

  return undefined;
}

const DEFAULT_THRESHOLDS: EnvThresholds = {
  CAT_HUNGRY_HOURS: 12,
  CAT_SMELLY_HOURS: 24,
  CAT_STRESSED_HOURS: 24,
  CAT_STRESS_AFTER_PLAY_MISS_HOURS: 3,
  CAT_STRESS_WARNING_LIMIT_HOURS: 12,
  CAT_SICK_AFTER_NO_PLAY_HOURS: 15,
  CAT_SICK_AFTER_SMELLY_HOURS: 72,
  CAT_DEATH_AFTER_NO_FEED_DAYS: 7,
  CAT_SICK_HOURS: 48,
  CAT_CRITICAL_HOURS: 24,
  CAT_DEAD_DAYS: 3,
  CAT_STAGE_JUNIOR_DAYS: 30,
  CAT_STAGE_ADULT_DAYS: 90,
  CAT_STAGE_MIDDLE_AGE_DAYS: 150,
  CAT_STAGE_SENIOR_DAYS: 210,
  CAT_STAGE_VETERAN_DAYS: 280,
  CAT_STAGE_LEGACY_DAYS: 365,
  CAT_COST_FEED: 100,
  CAT_COST_WASH: 150,
  CAT_COST_PLAY: 200,
  CAT_COST_HEAL: 1000,
};

/**
 * 환경 변수에서 고양이 상태/성장 계산에 필요한 임계값을 추출합니다.
 */
export function getCatThresholds(env: Partial<EnvThresholds>): EnvThresholds {
  return { ...DEFAULT_THRESHOLDS, ...env };
}

/**
 * T2-1. 배고픔 상태 계산
 */
export function isHungry(cat: Cat, currentTime: number, thresholds: EnvThresholds): boolean {
  return (currentTime - cat.lastFedAt) >= thresholds.CAT_HUNGRY_HOURS * MS_PER_HOUR;
}

/**
 * T2-2. 청결 상태 계산
 */
export function isSmelly(cat: Cat, currentTime: number, thresholds: EnvThresholds): boolean {
  return (currentTime - cat.lastWashedAt) >= thresholds.CAT_SMELLY_HOURS * MS_PER_HOUR;
}

/**
 * T2-3. 스트레스 상태 계산
 */
export function isStressed(cat: Cat, currentTime: number, thresholds: EnvThresholds): boolean {
  return (
    currentTime - cat.lastPlayedAt
  ) >= thresholds.CAT_STRESS_AFTER_PLAY_MISS_HOURS * MS_PER_HOUR;
}

/**
 * T2-3. 스트레스 상태 계산
 */
export function getStressState(
  cat: Cat,
  currentTime: number,
  thresholds: EnvThresholds
): 'healthy' | 'stressed' | 'warning' | 'sick' {
  const stressMs = thresholds.CAT_STRESS_AFTER_PLAY_MISS_HOURS * MS_PER_HOUR;
  const warningMs = thresholds.CAT_STRESS_WARNING_LIMIT_HOURS * MS_PER_HOUR;
  const sickMs = thresholds.CAT_SICK_AFTER_NO_PLAY_HOURS * MS_PER_HOUR;
  const elapsed = currentTime - cat.lastPlayedAt;

  if (elapsed >= sickMs) {
    return 'sick';
  }

  if (elapsed >= warningMs) {
    return 'warning';
  }

  if (elapsed >= stressMs) {
    return 'stressed';
  }

  return 'healthy';
}

/**
 * T2-4. 질병 및 사망 판정
 * 가장 오래 방치된 시간(min of interaction times)을 기준으로 판정
 */
export function calculateSeverityStatus(cat: Cat, currentTime: number, thresholds: EnvThresholds): 'healthy' | 'sick' | 'critical' | 'dead' {
  const feedElapsed = currentTime - cat.lastFedAt;
  const washElapsed = currentTime - cat.lastWashedAt;
  const playElapsed = currentTime - cat.lastPlayedAt;
  const treatmentRequiredAt = getTreatmentRequiredAt(cat, currentTime, thresholds);
  const criticalMs = thresholds.CAT_CRITICAL_HOURS * MS_PER_HOUR;

  if (feedElapsed >= thresholds.CAT_DEATH_AFTER_NO_FEED_DAYS * MS_PER_DAY) {
    return 'dead';
  }

  if (treatmentRequiredAt) {
    if ((currentTime - treatmentRequiredAt) >= thresholds.CAT_DEAD_DAYS * MS_PER_DAY) {
      return 'dead';
    }

    return 'sick';
  }

  if (
    washElapsed >= (thresholds.CAT_SICK_AFTER_SMELLY_HOURS * MS_PER_HOUR) + criticalMs ||
    playElapsed >= (thresholds.CAT_SICK_AFTER_NO_PLAY_HOURS * MS_PER_HOUR) + criticalMs
  ) {
    return 'critical';
  }

  if (
    washElapsed >= thresholds.CAT_SICK_AFTER_SMELLY_HOURS * MS_PER_HOUR ||
    playElapsed >= thresholds.CAT_SICK_AFTER_NO_PLAY_HOURS * MS_PER_HOUR
  ) {
    return 'sick';
  }

  return 'healthy';
}

/**
 * T2-4. 종합 건강 상태 계산
 */
export function deriveCatHealthStatus(input: {
  severityStatus: 'healthy' | 'sick' | 'critical' | 'dead';
  isHungry: boolean;
  isSmelly: boolean;
  stressStatus: 'healthy' | 'stressed' | 'warning' | 'sick';
}): CatStatus {
  const { severityStatus, isHungry, isSmelly, stressStatus } = input;

  if (severityStatus !== 'healthy') {
    return severityStatus;
  }

  if (isHungry) {
    return 'hungry';
  }

  if (isSmelly) {
    return 'smelly';
  }

  if (stressStatus === 'sick') {
    return 'sick';
  }

  if (stressStatus === 'stressed' || stressStatus === 'warning') {
    return 'stressed';
  }

  return 'healthy';
}

/**
 * T2-5. 사망 판정 함수
 */
export function shouldCatDie(
  cat: Cat,
  currentTime: number,
  env: Partial<EnvThresholds> = {}
): boolean {
  const thresholds = getCatThresholds(env);
  return calculateSeverityStatus(cat, currentTime, thresholds) === 'dead';
}

/**
 * T2-6. 전체 상태 스냅샷 생성 함수
 */
export function buildCatStateSnapshot(
  cat: Cat,
  currentTime: number = Date.now(),
  env: Partial<EnvThresholds> = {}
): CatStateSnapshot {
  const thresholds = getCatThresholds(env);
  const severityStatus = calculateSeverityStatus(cat, currentTime, thresholds);
  const stressStatus = getStressState(cat, currentTime, thresholds);
  const hungry = isHungry(cat, currentTime, thresholds);
  const smelly = isSmelly(cat, currentTime, thresholds);
  const status = deriveCatHealthStatus({
    severityStatus,
    isHungry: hungry,
    isSmelly: smelly,
    stressStatus
  });

  return {
    status,
    stage: calculateCatStage(cat.activeDays, thresholds),
    severityStatus,
    stressStatus,
    isHungry: hungry,
    isSmelly: smelly,
    isStressed: stressStatus !== 'healthy',
    isStressWarning: stressStatus === 'warning',
    shouldDie: severityStatus === 'dead'
  };
}

/**
 * T2-5. 종합 상태 판단 메인 함수
 * 현재 고양이의 Data 객체와 현재 시간을 받아 최신 CatStatus를 반환
 */
export function calculateCatStatus(cat: Cat, currentTime: number = Date.now(), env: Partial<EnvThresholds> = {}): CatStatus {
  return buildCatStateSnapshot(cat, currentTime, env).status;
}

/**
 * 고양이의 활성 일수(activeDays)를 기준으로 성장 단계를 계산합니다.
 */
export function calculateCatStage(activeDays: number, env: Partial<EnvThresholds> = {}): CatStage {
  const thresholds = getCatThresholds(env);
  
  if (activeDays >= thresholds.CAT_STAGE_LEGACY_DAYS) return 'legacy';
  if (activeDays >= thresholds.CAT_STAGE_VETERAN_DAYS) return 'veteran';
  if (activeDays >= thresholds.CAT_STAGE_SENIOR_DAYS) return 'senior';
  if (activeDays >= thresholds.CAT_STAGE_MIDDLE_AGE_DAYS) return 'middleAge';
  if (activeDays >= thresholds.CAT_STAGE_ADULT_DAYS) return 'adult';
  if (activeDays >= thresholds.CAT_STAGE_JUNIOR_DAYS) return 'junior';
  
  return 'kitten';
}
