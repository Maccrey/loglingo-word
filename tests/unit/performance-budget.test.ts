import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { afterEach, describe, expect, it } from 'vitest';

const tempFiles: string[] = [];

function writeTempResult(payload: object): string {
  const filePath = path.join(
    os.tmpdir(),
    `performance-budget-${Date.now()}-${Math.random().toString(16).slice(2)}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(payload), 'utf8');
  tempFiles.push(filePath);
  return filePath;
}

afterEach(() => {
  for (const filePath of tempFiles.splice(0)) {
    fs.rmSync(filePath, { force: true });
  }
});

describe('performance budget script', () => {
  it('passes when the budget result stays within thresholds', () => {
    const filePath = writeTempResult({
      lcpMs: 2200,
      lighthouseScore: 93,
      imageOptimization: true,
      bundleSplit: true
    });

    const output = execFileSync(
      'node',
      ['scripts/check-performance-budget.mjs', filePath],
      {
        cwd: '/Users/maccrey/Development/Loglingo_word',
        encoding: 'utf8'
      }
    );

    expect(output).toContain('Performance budget check passed.');
  });

  it('fails when the budget result exceeds thresholds', () => {
    const filePath = writeTempResult({
      lcpMs: 3100,
      lighthouseScore: 84,
      imageOptimization: false,
      bundleSplit: false
    });

    expect(() =>
      execFileSync('node', ['scripts/check-performance-budget.mjs', filePath], {
        cwd: '/Users/maccrey/Development/Loglingo_word',
        encoding: 'utf8',
        stdio: 'pipe'
      })
    ).toThrow();
  });
});
