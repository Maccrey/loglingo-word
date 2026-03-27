import SentenceClient from './SentenceClient';
import { resolveLocale } from '../i18n';

type SentencePageProps = {
  searchParams?: Promise<{
    locale?: string;
  }>;
};

export default async function SentencePage(props: SentencePageProps) {
  const searchParams = await props.searchParams;

  return <SentenceClient locale={resolveLocale(searchParams?.locale)} />;
}
