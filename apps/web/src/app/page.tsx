import HomeDashboard from './HomeDashboard';
import { resolveLocale } from './i18n';

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
  return (
    <HomeDashboard
      locale={resolveLocale(searchParams?.locale)}
      {...(searchParams?.source ? { pendingSource: searchParams.source } : {})}
      {...(searchParams?.points ? { pendingPoints: searchParams.points } : {})}
      {...(searchParams?.leaderboard
        ? { pendingLeaderboardScore: searchParams.leaderboard }
        : {})}
    />
  );
}
