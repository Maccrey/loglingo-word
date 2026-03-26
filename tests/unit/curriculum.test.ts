import { describe, expect, it } from 'vitest';

import {
  getCurriculumByLevel,
  getCurriculumUnits
} from '../../services/core/src/curriculum';

describe('curriculum', () => {
  it('sorts curriculum units by level and order', () => {
    const units = getCurriculumUnits();

    expect(units.map((unit) => unit.id)).toEqual([
      'starter-basics',
      'starter-routine',
      'travel-checkin'
    ]);
  });

  it('filters curriculum units by level', () => {
    const levelOneUnits = getCurriculumByLevel(1);

    expect(levelOneUnits).toHaveLength(2);
    expect(levelOneUnits.every((unit) => unit.level === 1)).toBe(true);
  });
});
