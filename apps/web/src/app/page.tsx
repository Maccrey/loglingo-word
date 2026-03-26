import HomeDashboard from './HomeDashboard';
import { getLeaderboardWeek } from '@wordflow/leaderboard';
import { resolveLocale } from './i18n';
import { getDashboardStatsRepository } from '../lib/dashboard-repository';
import { getLeaderboardRepository } from '../lib/leaderboard-repository';

type HomePageProps = {
  searchParams?: Promise<{
    locale?: string;
    source?: string;
    points?: string;
    leaderboard?: string;
  }>;
};

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;
  const initialStats =
    await getDashboardStatsRepository().findByUserId('demo-user');
  const currentWeek = getLeaderboardWeek('2026-03-26T00:00:00.000Z');
  const leaderboardEntries = await getLeaderboardRepository().listByWeekId(
    currentWeek.weekId
  );
  const myEntry =
    leaderboardEntries.find((entry) => entry.userId === 'demo-user') ?? null;

  return (
    <HomeDashboard
      locale={resolveLocale(searchParams?.locale)}
      initialStats={initialStats}
      leaderboardPreview={{
        weekId: currentWeek.weekId,
        myRank: myEntry?.rank ?? null,
        topEntries: leaderboardEntries.slice(0, 3).map((entry) => ({
          userId: entry.userId,
          rank: entry.rank,
          score: entry.score,
          isCurrentUser: entry.userId === 'demo-user'
        }))
      }}
      {...(searchParams?.source ? { pendingSource: searchParams.source } : {})}
      {...(searchParams?.points ? { pendingPoints: searchParams.points } : {})}
      {...(searchParams?.leaderboard
        ? { pendingLeaderboardScore: searchParams.leaderboard }
        : {})}
    />
  );
}
