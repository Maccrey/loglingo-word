import { describe, expect, it } from 'vitest';

import type { Cat } from '@wordflow/shared/cat';

import { getDailyCareChecklist } from '../../apps/web/src/lib/careChecklist';

function createCat(input?: Partial<Cat>): Cat {
  return {
    id: 'cat-1',
    userId: 'user-1',
    name: '로그링고',
    stage: 'kitten',
    status: 'healthy',
    createdAt: new Date('2026-04-02T08:00:00+09:00').getTime(),
    updatedAt: new Date('2026-04-02T08:00:00+09:00').getTime(),
    lastFedAt: new Date('2026-04-02T08:00:00+09:00').getTime(),
    lastWashedAt: new Date('2026-04-02T08:00:00+09:00').getTime(),
    lastPlayedAt: new Date('2026-04-02T08:00:00+09:00').getTime(),
    activeDays: 0,
    dailyCareCompletion: {},
    ...input
  };
}

describe('daily care checklist', () => {
  it('marks care as pending when the cat was only initialized today', () => {
    const now = new Date('2026-04-02T09:00:00+09:00').getTime();
    const checklist = getDailyCareChecklist(createCat(), now);

    expect(checklist).toEqual([
      { action: 'feed', label: '밥주기', done: false },
      { action: 'wash', label: '씻기기', done: false },
      { action: 'play', label: '놀아주기', done: false }
    ]);
  });

  it('marks only feeding as complete when feed happened after creation today', () => {
    const now = new Date('2026-04-02T12:00:00+09:00').getTime();
    const checklist = getDailyCareChecklist(
      createCat({
        updatedAt: now,
        lastFedAt: new Date('2026-04-02T11:30:00+09:00').getTime(),
        dailyCareCompletion: {
          feed: '2026-04-02'
        }
      }),
      now
    );

    expect(checklist).toEqual([
      { action: 'feed', label: '밥주기', done: true },
      { action: 'wash', label: '씻기기', done: false },
      { action: 'play', label: '놀아주기', done: false }
    ]);
  });

  it('does not mark wash or play complete just because timestamps were refreshed today', () => {
    const now = new Date('2026-04-02T18:00:00+09:00').getTime();
    const checklist = getDailyCareChecklist(
      createCat({
        updatedAt: now,
        lastWashedAt: now,
        lastPlayedAt: now,
        dailyCareCompletion: {
          feed: '2026-04-02'
        }
      }),
      now
    );

    expect(checklist).toEqual([
      { action: 'feed', label: '밥주기', done: true },
      { action: 'wash', label: '씻기기', done: false },
      { action: 'play', label: '놀아주기', done: false }
    ]);
  });
});
