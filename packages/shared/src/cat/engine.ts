import type { Cat, CatStage, CatStatus } from './types';

export interface EnvThresholds {
  CAT_HUNGRY_HOURS: number;
  CAT_SMELLY_HOURS: number;
  CAT_STRESSED_HOURS: number;
  CAT_SICK_HOURS: number;
  CAT_CRITICAL_HOURS: number;
  CAT_DEAD_DAYS: number;
  CAT_STAGE_JUNIOR_DAYS: number;
  CAT_STAGE_ADULT_DAYS: number;
  CAT_STAGE_MIDDLE_AGE_DAYS: number;
  CAT_STAGE_SENIOR_DAYS: number;
  CAT_STAGE_VETERAN_DAYS: number;
  CAT_STAGE_LEGACY_DAYS: number;
}

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const DEFAULT_THRESHOLDS: EnvThresholds = {
  CAT_HUNGRY_HOURS: 12,
  CAT_SMELLY_HOURS: 24,
  CAT_STRESSED_HOURS: 24,
  CAT_SICK_HOURS: 48,
  CAT_CRITICAL_HOURS: 24,
  CAT_DEAD_DAYS: 3,
  CAT_STAGE_JUNIOR_DAYS: 30,
  CAT_STAGE_ADULT_DAYS: 90,
  CAT_STAGE_MIDDLE_AGE_DAYS: 150,
  CAT_STAGE_SENIOR_DAYS: 210,
  CAT_STAGE_VETERAN_DAYS: 280,
  CAT_STAGE_LEGACY_DAYS: 365,
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
  return (currentTime - cat.lastPlayedAt) >= thresholds.CAT_STRESSED_HOURS * MS_PER_HOUR;
}

/**
 * T2-4. 질병 및 사망 판정
 * 가장 오래 방치된 시간(min of interaction times)을 기준으로 판정
 */
export function calculateSeverityStatus(cat: Cat, currentTime: number, thresholds: EnvThresholds): 'healthy' | 'sick' | 'critical' | 'dead' {
  const lastInteraction = Math.min(cat.lastFedAt, cat.lastWashedAt, cat.lastPlayedAt);
  const msSinceLastInteraction = currentTime - lastInteraction;

  // Base threshold is the minimum interaction gap (using Hungry as base)
  const baseMs = thresholds.CAT_HUNGRY_HOURS * MS_PER_HOUR;
  const sickMs = baseMs + (thresholds.CAT_SICK_HOURS * MS_PER_HOUR);
  const criticalMs = sickMs + (thresholds.CAT_CRITICAL_HOURS * MS_PER_HOUR);
  const deadMs = criticalMs + (thresholds.CAT_DEAD_DAYS * MS_PER_DAY);

  if (msSinceLastInteraction >= deadMs) return 'dead';
  if (msSinceLastInteraction >= criticalMs) return 'critical';
  if (msSinceLastInteraction >= sickMs) return 'sick';
  
  return 'healthy';
}

/**
 * T2-5. 종합 상태 판단 메인 함수
 * 현재 고양이의 Data 객체와 현재 시간을 받아 최신 CatStatus를 반환
 */
export function calculateCatStatus(cat: Cat, currentTime: number = Date.now(), env: Partial<EnvThresholds> = {}): CatStatus {
  const thresholds = getCatThresholds(env);
  
  // 1. 위급/사망/질병 상태 먼저 판단
  const severity = calculateSeverityStatus(cat, currentTime, thresholds);
  if (severity !== 'healthy') {
    return severity; // 'dead', 'critical', 'sick'
  }

  // 2. 기본 상태 판별 (우선순위: Hungry > Smelly > Stressed)
  if (isHungry(cat, currentTime, thresholds)) return 'hungry';
  if (isSmelly(cat, currentTime, thresholds)) return 'smelly';
  if (isStressed(cat, currentTime, thresholds)) return 'stressed';

  // 3. 아무 문제 없으면 건강함
  return 'healthy';
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
