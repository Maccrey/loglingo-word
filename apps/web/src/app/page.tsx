import HomeDashboard from './HomeDashboard';
import { resolveLocale } from './i18n';
import { getDashboardStatsRepository } from '../lib/dashboard-repository';

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

  return (
    <HomeDashboard
      locale={resolveLocale(searchParams?.locale)}
      initialStats={initialStats}
      {...(searchParams?.source ? { pendingSource: searchParams.source } : {})}
      {...(searchParams?.points ? { pendingPoints: searchParams.points } : {})}
      {...(searchParams?.leaderboard
        ? { pendingLeaderboardScore: searchParams.leaderboard }
        : {})}
    />
  );
}
