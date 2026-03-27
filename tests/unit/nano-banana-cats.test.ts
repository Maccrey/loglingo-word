import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const requiredCatPromptFiles = [
  'assets/prompts/nano-banana/cats/kitten-base.txt',
  'assets/prompts/nano-banana/cats/junior-healthy.txt',
  'assets/prompts/nano-banana/cats/adult-healthy.txt',
  'assets/prompts/nano-banana/cats/middle-age-healthy.txt',
  'assets/prompts/nano-banana/cats/senior-healthy.txt',
  'assets/prompts/nano-banana/cats/veteran-healthy.txt',
  'assets/prompts/nano-banana/cats/legacy-healthy.txt'
];

describe('nano banana cat prompts', () => {
  it('contains all required stage prompt files', () => {
    for (const file of requiredCatPromptFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8').trim();

      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('No text, no watermark');
    }
  });
});
