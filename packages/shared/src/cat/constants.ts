export const CAT_STAGES = [
  'kitten',
  'junior',
  'adult',
  'middleAge',
  'senior',
  'veteran',
  'legacy',
] as const;

export const CAT_STATUSES = [
  'healthy',
  'hungry',
  'smelly',
  'stressed',
  'sick',
  'critical',
  'dead',
] as const;

export const CAT_CARE_ACTIONS = [
  'feed',
  'wash',
  'play',
  'heal',
] as const;

// Time thresholds (in milliseconds) generally used for validation
export const HOURS_IN_MS = 60 * 60 * 1000;
export const DAYS_IN_MS = 24 * HOURS_IN_MS;
