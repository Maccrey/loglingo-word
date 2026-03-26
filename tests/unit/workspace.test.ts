import { describe, expect, it } from 'vitest';

import { parseEnv } from '@wordflow/shared/env';

describe('workspace alias', () => {
  it('resolves @wordflow/shared path alias', () => {
    const result = parseEnv({
      NODE_ENV: 'test',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'firebase-api-key',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'wordflow-dev',
      FIREBASE_CLIENT_EMAIL: 'firebase-admin@example.com',
      FIREBASE_PRIVATE_KEY: 'private-key',
      OPENAI_API_KEY: 'openai-key',
      POLAR_ACCESS_TOKEN: 'polar-token',
      POLAR_WEBHOOK_SECRET: 'polar-secret'
    });

    expect(result.NODE_ENV).toBe('test');
  });
});
