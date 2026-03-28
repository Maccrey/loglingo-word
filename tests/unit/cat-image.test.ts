import { describe, expect, it } from 'vitest';

import {
  getCatImagePath,
  normalizeCatImageStage,
  normalizeCatImageStatus
} from '../../apps/web/src/lib/catImage';

describe('cat image mapping', () => {
  it('converts middleAge to middle-age for filenames', () => {
    expect(normalizeCatImageStage('middleAge')).toBe('middle-age');
  });

  it('maps healthy kitten to kitten-base', () => {
    expect(normalizeCatImageStatus('kitten', 'healthy')).toBe('base');
    expect(getCatImagePath('kitten', 'healthy')).toBe(
      '/images/cats/kitten-base.png'
    );
  });

  it('returns action image paths for care overlays', () => {
    expect(getCatImagePath('adult', 'action-feed')).toBe(
      '/images/cats/adult-action-feed.png'
    );
    expect(getCatImagePath('senior', 'action-play')).toBe(
      '/images/cats/senior-action-play.png'
    );
    expect(getCatImagePath('adult', 'action-heal')).toBe(
      '/images/cats/adult_action_medicine.png'
    );
    expect(getCatImagePath('middleAge', 'action-medicine')).toBe(
      '/images/cats/middle_age_medicine.png'
    );
  });

  it('falls back across stages when a matching image is missing', () => {
    expect(getCatImagePath('legacy', 'action-wash')).toBe(
      '/images/cats/veteran-action-wash.png'
    );
    expect(getCatImagePath('legacy', 'action-medicine')).toBe(
      '/images/cats/veteran_action_medicine.png'
    );
  });

  it('uses kitten-base as the final fallback', () => {
    expect(getCatImagePath('legacy', 'unknown-status')).toBe(
      '/images/cats/kitten-base.png'
    );
  });
});
