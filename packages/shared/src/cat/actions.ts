import type { Cat, CatCareActionType, CatDailyCareAction } from './types';
import { type EnvThresholds, getCatThresholds, calculateCatStatus } from './engine';

export interface ActionResult {
  success: boolean;
  cost: number;
  newCat: Cat;
  error?: string;
}

function createErrorResult(cat: Cat, message: string): ActionResult {
  return { success: false, cost: 0, newCat: cat, error: message };
}

function getLocalDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function markDailyCareCompleted(cat: Cat, action: CatDailyCareAction, currentTime: number) {
  return {
    ...(cat.dailyCareCompletion ?? {}),
    [action]: getLocalDayKey(currentTime)
  };
}

/**
 * T3-1. 먹이주기 액션 구현
 */
export function feedCat(cat: Cat, currentPoints: number, currentTime: number, thresholds: EnvThresholds): ActionResult {
  const cost = thresholds.CAT_COST_FEED ?? 100; // env.ts defaults to 100
  if (currentPoints < cost) {
    return createErrorResult(cat, 'Not enough points to feed the cat.');
  }
  return {
    success: true,
    cost,
    newCat: {
      ...cat,
      lastFedAt: currentTime,
      updatedAt: currentTime,
      dailyCareCompletion: markDailyCareCompleted(cat, 'feed', currentTime)
    },
  };
}

/**
 * T3-2. 목욕하기 액션 구현
 */
export function batheCat(cat: Cat, currentPoints: number, currentTime: number, thresholds: EnvThresholds): ActionResult {
  const cost = thresholds.CAT_COST_WASH ?? 150;
  if (currentPoints < cost) {
    return createErrorResult(cat, 'Not enough points to wash the cat.');
  }
  return {
    success: true,
    cost,
    newCat: {
      ...cat,
      lastWashedAt: currentTime,
      updatedAt: currentTime,
      dailyCareCompletion: markDailyCareCompleted(cat, 'wash', currentTime)
    },
  };
}

/**
 * T3-3. 놀아주기 액션 구현
 */
export function playWithCat(cat: Cat, currentPoints: number, currentTime: number, thresholds: EnvThresholds): ActionResult {
  const cost = thresholds.CAT_COST_PLAY ?? 200;
  if (currentPoints < cost) {
    return createErrorResult(cat, 'Not enough points to play with the cat.');
  }
  return {
    success: true,
    cost,
    newCat: {
      ...cat,
      lastPlayedAt: currentTime,
      updatedAt: currentTime,
      dailyCareCompletion: markDailyCareCompleted(cat, 'play', currentTime)
    },
  };
}

/**
 * T3-4. 약먹이기 액션 구현 (sick 상태 시)
 */
export function giveMedicine(cat: Cat, currentPoints: number, currentTime: number, thresholds: EnvThresholds): ActionResult {
  const cost = thresholds.CAT_COST_HEAL ?? 1000;
  if (currentPoints < cost) {
    return createErrorResult(cat, 'Not enough points for medicine.');
  }
  return {
    success: true,
    cost,
    // Reset all interaction timers to current time to cure the cat completely from sick
    newCat: { 
      ...cat,
      lastFedAt: currentTime,
      lastWashedAt: currentTime,
      lastPlayedAt: currentTime,
      updatedAt: currentTime,
      treatmentRequiredAt: undefined
    },
  };
}

/**
 * T3-5. 주사맞히기 액션 구현 (critical 상태 시)
 */
export function giveInjection(cat: Cat, currentPoints: number, currentTime: number, thresholds: EnvThresholds): ActionResult {
  // Critical might cost more in the future, but using heal cost for now.
  const cost = thresholds.CAT_COST_HEAL ?? 1000;
  if (currentPoints < cost) {
    return createErrorResult(cat, 'Not enough points for injection.');
  }
  return {
    success: true,
    cost,
    // Deep heal
    newCat: { 
      ...cat, 
      lastFedAt: currentTime,
      lastWashedAt: currentTime,
      lastPlayedAt: currentTime,
      updatedAt: currentTime,
      treatmentRequiredAt: undefined
    },
  };
}

/**
 * T3-6. 돌봄 액션 서비스 구현 (Routing)
 */
export function performCatCareAction(
  cat: Cat,
  action: CatCareActionType,
  currentPoints: number,
  currentTime: number = Date.now(),
  env: Partial<EnvThresholds> = {}
): ActionResult {
  const currentStatus = calculateCatStatus(cat, currentTime, env);
  
  // Dead cats cannot be interacted with normal actions
  if (currentStatus === 'dead') {
    return createErrorResult(cat, 'The cat has passed away. Resurrect needed.');
  }

  const thresholds = getCatThresholds(env);

  switch (action) {
    case 'feed':
      return feedCat(cat, currentPoints, currentTime, thresholds);
    case 'wash':
      return batheCat(cat, currentPoints, currentTime, thresholds);
    case 'play':
      return playWithCat(cat, currentPoints, currentTime, thresholds);
    case 'heal':
      // Route heal to medicine or injection depending on severity
      if (currentStatus === 'critical') {
        return giveInjection(cat, currentPoints, currentTime, thresholds);
      } else if (currentStatus === 'sick') {
        return giveMedicine(cat, currentPoints, currentTime, thresholds);
      } else {
        return createErrorResult(cat, 'The cat is not sick or critical.');
      }
    default:
      return createErrorResult(cat, 'Unknown action.');
  }
}
