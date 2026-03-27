import FlashcardsClient from './FlashcardsClient';
import { resolveLocale } from '../i18n';

type LearnPageProps = {
  searchParams?: Promise<{ focus?: string; locale?: string }>;
};

function parseFocusWordIds(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function LearnPage(props: LearnPageProps) {
  const searchParams = await props.searchParams;

  return (
    <FlashcardsClient
      locale={resolveLocale(searchParams?.locale)}
      focusWordIds={parseFocusWordIds(searchParams?.focus)}
    />
  );
}
