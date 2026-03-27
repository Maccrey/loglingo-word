import { describe, expect, it } from 'vitest';

import { parseEnv } from '../../packages/shared/src/env';

const validEnv = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'firebase-api-key',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'wordflow-dev',
  FIREBASE_CLIENT_EMAIL: 'firebase-admin@example.com',
  FIREBASE_PRIVATE_KEY: 'private-key',
  OPENAI_API_KEY: 'openai-key',
  POLAR_ACCESS_TOKEN: 'polar-token',
  POLAR_WEBHOOK_SECRET: 'polar-secret'
} as const;

describe('parseEnv', () => {
  it('parses required variables', () => {
    expect(parseEnv(validEnv)).toMatchObject(validEnv);
  });

  it('throws when a required variable is missing', () => {
    expect(() =>
      parseEnv({
        ...validEnv,
        OPENAI_API_KEY: undefined
      })
    ).toThrow();
  });

  it('applies default values for cat and point configurations', () => {
    const parsed = parseEnv(validEnv);
    expect(parsed.CAT_STAGE_JUNIOR_DAYS).toBe(30);
    expect(parsed.CAT_STAGE_LEGACY_DAYS).toBe(365);
    expect(parsed.POINTS_LEARNING_BASE).toBe(500);
    expect(parsed.CAT_COST_HEAL).toBe(1000);
    expect(parsed.CAT_DEAD_DAYS).toBe(3);
    expect(parsed.CAT_STRESS_AFTER_PLAY_MISS_HOURS).toBe(3);
    expect(parsed.CAT_STRESS_WARNING_LIMIT_HOURS).toBe(12);
    expect(parsed.CAT_SICK_AFTER_NO_PLAY_HOURS).toBe(15);
  });

  it('coerces string numbers for cat and point configurations', () => {
    const parsed = parseEnv({
      ...validEnv,
      CAT_STAGE_JUNIOR_DAYS: '40',
      CAT_STRESS_WARNING_LIMIT_HOURS: '10'
    });
    expect(parsed.CAT_STAGE_JUNIOR_DAYS).toBe(40);
    expect(parsed.CAT_STRESS_WARNING_LIMIT_HOURS).toBe(10);
  });
});
