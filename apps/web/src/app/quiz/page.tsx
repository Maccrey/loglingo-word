import QuizClient from './QuizClient';
import { resolveLocale } from '../i18n';

type QuizPageProps = {
  searchParams?: Promise<{
    locale?: string;
  }>;
};

export default async function QuizPage(props: QuizPageProps) {
  const searchParams = await props.searchParams;

  return <QuizClient locale={resolveLocale(searchParams?.locale)} />;
}
