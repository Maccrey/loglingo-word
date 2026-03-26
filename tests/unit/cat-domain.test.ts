import { describe, it, expect } from 'vitest';
import { CAT_STAGES, CAT_STATUSES, CAT_CARE_ACTIONS } from '@wordflow/shared/cat';

describe('Cat Domain Constants & Types', () => {
  it('should export correct CAT_STAGES', () => {
    expect(CAT_STAGES).toEqual([
      'kitten',
      'junior',
      'adult',
      'middleAge',
      'senior',
      'veteran',
      'legacy',
    ]);
  });

  it('should export correct CAT_STATUSES', () => {
    expect(CAT_STATUSES).toContain('healthy');
    expect(CAT_STATUSES).toContain('hungry');
    expect(CAT_STATUSES).toContain('smelly');
    expect(CAT_STATUSES).toContain('stressed');
    expect(CAT_STATUSES).toContain('sick');
    expect(CAT_STATUSES).toContain('critical');
    expect(CAT_STATUSES).toContain('dead');
    expect(CAT_STATUSES.length).toBe(7);
  });

  it('should export correct CAT_CARE_ACTIONS', () => {
    expect(CAT_CARE_ACTIONS).toContain('feed');
    expect(CAT_CARE_ACTIONS).toContain('wash');
    expect(CAT_CARE_ACTIONS).toContain('play');
    expect(CAT_CARE_ACTIONS).toContain('heal');
    expect(CAT_CARE_ACTIONS.length).toBe(4);
  });
});
