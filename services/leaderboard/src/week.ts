export type LeaderboardWeek = {
  weekId: string;
  weekStart: string;
  weekEnd: string;
};

function startOfUtcDay(timestamp: string): Date {
  const date = new Date(timestamp);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getLeaderboardWeek(timestamp: string): LeaderboardWeek {
  const date = startOfUtcDay(timestamp);
  const day = date.getUTCDay();
  const isoDay = day === 0 ? 7 : day;
  const weekStartDate = addUtcDays(date, 1 - isoDay);
  const weekEndDate = addUtcDays(weekStartDate, 6);

  const thursday = addUtcDays(weekStartDate, 3);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const yearStartDay = yearStart.getUTCDay();
  const yearStartIsoDay = yearStartDay === 0 ? 7 : yearStartDay;
  const firstWeekStart = addUtcDays(yearStart, 1 - yearStartIsoDay);
  const weekNumber =
    Math.floor(
      (weekStartDate.getTime() - firstWeekStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    ) + 1;

  return {
    weekId: `${thursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`,
    weekStart: formatDate(weekStartDate),
    weekEnd: formatDate(weekEndDate)
  };
}
