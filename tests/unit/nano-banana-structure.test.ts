import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const requiredDirectories = [
  'assets/prompts/nano-banana/cats',
  'assets/prompts/nano-banana/care'
];

const requiredFiles = [
  'assets/prompts/nano-banana/cats/kitten-base.txt',
  'assets/prompts/nano-banana/cats/junior-healthy.txt',
  'assets/prompts/nano-banana/cats/adult-healthy.txt',
  'assets/prompts/nano-banana/cats/middle-age-healthy.txt',
  'assets/prompts/nano-banana/cats/senior-healthy.txt',
  'assets/prompts/nano-banana/cats/veteran-healthy.txt',
  'assets/prompts/nano-banana/cats/legacy-healthy.txt',
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

describe('nano banana prompt structure', () => {
  it('contains the required prompt directories', () => {
    for (const directory of requiredDirectories) {
      expect(existsSync(resolve(process.cwd(), directory))).toBe(true);
    }
  });

  it('contains the required prompt files', () => {
    for (const file of requiredFiles) {
      expect(existsSync(resolve(process.cwd(), file))).toBe(true);
    }
  });
});
