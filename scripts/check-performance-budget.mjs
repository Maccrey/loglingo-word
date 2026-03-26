#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const defaultBudget = {
  lcpMs: 2500,
  lighthouseScore: 90,
  imageOptimization: true,
  bundleSplit: true
};

function readInput(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function evaluateBudget(result) {
  const failures = [];

  if (typeof result.lcpMs !== 'number' || result.lcpMs > defaultBudget.lcpMs) {
    failures.push(`LCP budget failed: ${result.lcpMs}ms`);
  }

  if (
    typeof result.lighthouseScore !== 'number' ||
    result.lighthouseScore < defaultBudget.lighthouseScore
  ) {
    failures.push(`Lighthouse budget failed: ${result.lighthouseScore}`);
  }

  if (result.imageOptimization !== defaultBudget.imageOptimization) {
    failures.push('Image optimization check failed.');
  }

  if (result.bundleSplit !== defaultBudget.bundleSplit) {
    failures.push('Bundle split check failed.');
  }

  return {
    ok: failures.length === 0,
    failures
  };
}

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error(
      'Usage: node scripts/check-performance-budget.mjs <result.json>'
    );
    process.exit(1);
  }

  const result = readInput(filePath);
  const evaluation = evaluateBudget(result);

  if (!evaluation.ok) {
    console.error('Performance budget check failed.');
    for (const failure of evaluation.failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Performance budget check passed.');
}

main();
