import { describe, expect, it } from 'vitest';

import { canRequestWeeklyRecommendation } from '../../services/ai/src/recommendation';

describe('weekly recommendation limit', () => {
  it('blocks repeated requests in the same week', () => {
    const result = canRequestWeeklyRecommendation(
      '2026-03-26T12:00:00.000Z',
      '2026-03-24T09:00:00.000Z'
    );

    expect(result.allowed).toBe(false);
    expect(result.currentWeekId).toBe('2026-W13');
    expect(result.lastRequestedWeekId).toBe('2026-W13');
  });

  it('allows requests in a different week', () => {
    const result = canRequestWeeklyRecommendation(
      '2026-03-30T00:00:00.000Z',
      '2026-03-26T12:00:00.000Z'
    );

    expect(result.allowed).toBe(true);
    expect(result.currentWeekId).toBe('2026-W14');
    expect(result.lastRequestedWeekId).toBe('2026-W13');
  });
});
