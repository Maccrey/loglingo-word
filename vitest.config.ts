import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@wordflow/ai': path.resolve(rootDir, 'services/ai/src'),
      '@wordflow/core': path.resolve(rootDir, 'services/core/src'),
      '@wordflow/leaderboard': path.resolve(
        rootDir,
        'services/leaderboard/src'
      ),
      '@wordflow/payment': path.resolve(rootDir, 'services/payment/src'),
      '@wordflow/shared': path.resolve(rootDir, 'packages/shared/src')
    }
  },
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
