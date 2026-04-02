'use client';

const DAILY_LEARNED_KEY = 'wordflow_daily_learned_count';

export type DailyProgress = {
  date: string; // YYYY-MM-DD
  count: number;
  cycles: number;
};

export function getTodayLearnedSnapshot(): DailyProgress {
  if (typeof window === 'undefined') {
    return { date: '', count: 0, cycles: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const stored = window.localStorage.getItem(DAILY_LEARNED_KEY);

  if (!stored) {
    return { date: todayStr ?? '', count: 0, cycles: 0 };
  }

  try {
    const parsed = JSON.parse(stored) as DailyProgress;
    if (parsed.date === todayStr) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse daily progress', e);
  }

  return { date: todayStr ?? '', count: 0, cycles: 0 };
}

export function saveTodayLearned(count: number, cycles: number) {
  if (typeof window === 'undefined') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const progress: DailyProgress = {
    date: todayStr ?? '',
    count,
    cycles
  };

  window.localStorage.setItem(DAILY_LEARNED_KEY, JSON.stringify(progress));
}
