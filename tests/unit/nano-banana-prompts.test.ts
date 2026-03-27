import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const promptFiles = [
  'assets/prompts/nano-banana/care/action-feed.txt',
  'assets/prompts/nano-banana/care/action-play.txt',
  'assets/prompts/nano-banana/care/action-wash.txt',
  'assets/prompts/nano-banana/care/kitten-action-medicine.txt',
  'assets/prompts/nano-banana/care/junior-action-medicine.txt',
  'assets/prompts/nano-banana/care/adult-action-medicine.txt',
  'assets/prompts/nano-banana/care/middle-age-action-medicine.txt',
  'assets/prompts/nano-banana/care/senior-action-medicine.txt',
  'assets/prompts/nano-banana/care/veteran-action-medicine.txt'
];

describe('nano banana care prompts', () => {
  it('contains all required care prompt files', () => {
    for (const file of promptFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8').trim();

      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('No text, no watermark');
    }
  });
});
