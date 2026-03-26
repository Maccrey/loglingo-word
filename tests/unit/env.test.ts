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
});
