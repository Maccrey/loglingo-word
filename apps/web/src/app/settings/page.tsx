import SettingsClient from './SettingsClient';
import { resolveLocale } from '../i18n';

type SettingsPageProps = {
  searchParams?: Promise<{
    locale?: string;
  }>;
};

export default async function SettingsPage(props: SettingsPageProps) {
  const searchParams = await props.searchParams;

  return <SettingsClient locale={resolveLocale(searchParams?.locale)} />;
}
