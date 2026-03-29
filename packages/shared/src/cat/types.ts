import { CAT_STAGES, CAT_STATUSES, CAT_CARE_ACTIONS } from './constants';

export type CatStage = typeof CAT_STAGES[number];
export type CatStatus = typeof CAT_STATUSES[number];
export type CatCareActionType = typeof CAT_CARE_ACTIONS[number];

export interface Cat {
  id: string;
  userId: string;
  name: string;
  stage: CatStage;
  status: CatStatus;
  createdAt: number;
  updatedAt: number;
  lastFedAt: number;
  lastWashedAt: number;
  lastPlayedAt: number;
  // Accumulated health/growth metrics
  activeDays: number;
  // Used for keeping alive without interaction
  resurrectedAt?: number;
  treatmentRequiredAt?: number;
}

export interface CatCareAction {
  action: CatCareActionType;
  cost: number;
  timestamp: number;
}

export type PointLedgerReason =
  | 'learning_reward'
  | 'daily_bonus'
  | 'cat_care_feed'
  | 'cat_care_wash'
  | 'cat_care_play'
  | 'cat_care_heal'
  | 'system_correction';

export interface PointLedger {
  id: string;
  userId: string;
  amount: number; // positive for gain, negative for spent
  reason: PointLedgerReason;
  createdAt: number;
}
