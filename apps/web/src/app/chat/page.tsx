import ChatClient from './ChatClient';
import { resolveLocale } from '../i18n';

type ChatPageProps = {
  searchParams?: Promise<{
    locale?: string;
  }>;
};

export default async function ChatPage(props: ChatPageProps) {
  const searchParams = await props.searchParams;

  return <ChatClient locale={resolveLocale(searchParams?.locale)} />;
}
