import type { Cat } from './types';
import { type EnvThresholds, calculateCatStatus, calculateCatStage, getCatThresholds, getTreatmentRequiredAt } from './engine';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * T4-1. 성장 일수 계산 함수 구현
 * updatedAt과 currentTime 사이의 시간을 계산하여,
 * 고양이가 dead, critical, sick 생태가 아니었을 때만 activeDays를 누적합니다.
 */
export function calculateGrowthDays(
  cat: Cat,
  currentTime: number = Date.now(),
  env: Partial<EnvThresholds> = {}
): Cat {
  const thresholds = getCatThresholds(env);
  const currentStatus = calculateCatStatus(cat, currentTime, env);
  const treatmentRequiredAt = getTreatmentRequiredAt(cat, currentTime, thresholds);
  
  // If severely neglected, do not grow. Simply return the cat unaffected.
  if (currentStatus === 'dead' || currentStatus === 'critical' || currentStatus === 'sick') {
    return { ...cat, updatedAt: currentTime, treatmentRequiredAt };
  }

  const deltaMs = currentTime - cat.updatedAt;
  
  // No backward time travel
  if (deltaMs <= 0) {
    return cat;
  }

  const addedDays = deltaMs / MS_PER_DAY;
  const newActiveDays = cat.activeDays + addedDays;
  const newStage = calculateCatStage(newActiveDays, env);

  return {
    ...cat,
    activeDays: newActiveDays,
    stage: newStage,
    updatedAt: currentTime,
    treatmentRequiredAt: undefined,
  };
}

/**
 * T4-3. 추가 새끼 고양이 보상 조건 판별
 * 고양이가 'legacy' 단계에 도달하면 보상을 지급할 수 있습니다.
 */
export function canGrantExtraKitten(cat: Cat, env: Partial<EnvThresholds> = {}): boolean {
  return calculateCatStage(cat.activeDays, env) === 'legacy';
}

/**
 * T4-4. 멀티 캣 슬롯 
 * 유저의 고양이 슬롯 제한 규칙을 검증합니다.
 */
export function validateMultiCatSlots(cats: Cat[], maxSlots: number = 2): boolean {
  return cats.length < maxSlots;
}

/**
 * 여러 마리의 고양이 중 활동할 대상 대표 고양이를 선택합니다.
 */
export function selectActiveCat(cats: Cat[], targetId: string): Cat | undefined {
  return cats.find(c => c.id === targetId);
}
