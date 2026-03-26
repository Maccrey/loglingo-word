import FlashcardsClient from './FlashcardsClient';

type LearnPageProps = {
  searchParams?: Promise<{ focus?: string }>;
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
    <FlashcardsClient focusWordIds={parseFocusWordIds(searchParams?.focus)} />
  );
}
