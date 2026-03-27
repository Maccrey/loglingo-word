import OnboardingClient from './OnboardingClient';
import { resolveLocale } from '../i18n';

type OnboardingPageProps = {
  searchParams?: Promise<{
    locale?: string;
  }>;
};

export default async function OnboardingPage(props: OnboardingPageProps) {
  const searchParams = await props.searchParams;

  return <OnboardingClient locale={resolveLocale(searchParams?.locale)} />;
}
