import HomeDashboard from './HomeDashboard';
import { resolveLocale } from './i18n';

type HomePageProps = {
  searchParams?: Promise<{ locale?: string }>;
};

export default async function HomePage(props: HomePageProps) {
  const searchParams = await props.searchParams;
  return <HomeDashboard locale={resolveLocale(searchParams?.locale)} />;
}
