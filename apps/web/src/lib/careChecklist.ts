import type { Cat, CatDailyCareAction } from '@wordflow/shared/cat';

export function getLocalDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function hasCompletedCareToday(cat: Cat, action: CatDailyCareAction, now: number): boolean {
  return cat.dailyCareCompletion?.[action] === getLocalDayKey(now);
}

export function getDailyCareChecklist(cat: Cat, now: number) {
  return [
    {
      action: 'feed',
      label: '밥주기',
      done: hasCompletedCareToday(cat, 'feed', now)
    },
    {
      action: 'wash',
      label: '씻기기',
      done: hasCompletedCareToday(cat, 'wash', now)
    },
    {
      action: 'play',
      label: '놀아주기',
      done: hasCompletedCareToday(cat, 'play', now)
    }
  ] as const;
}
