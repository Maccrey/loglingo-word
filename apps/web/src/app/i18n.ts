import en from '../../../../locales/en.json';
import ko from '../../../../locales/ko.json';
import { translate, type LocaleMessages } from '@wordflow/shared/i18n';

export type AppLocale = 'ko' | 'en';

const localeMessages: Record<AppLocale, LocaleMessages> = {
  ko,
  en
};

export function resolveLocale(locale?: string): AppLocale {
  return locale === 'en' ? 'en' : 'ko';
}

export function getLocaleMessages(locale: AppLocale): LocaleMessages {
  return localeMessages[locale];
}

export function t(locale: AppLocale, key: string): string {
  return translate({
    key,
    localeMessages: getLocaleMessages(locale),
    fallbackMessages: getLocaleMessages('en')
  });
}
