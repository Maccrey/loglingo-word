'use client';

import { readStoredSettingsSnapshot } from './settingsStorage';

export const APP_TOAST_EVENT = 'app-toast';

export type AppToastPayload = {
  id?: string;
  title?: string;
  message: string;
  tone?: 'success' | 'info';
  durationMs?: number;
};

function fallbackMessageForLocale(input: {
  ko: string;
  en: string;
}) {
  const locale = readStoredSettingsSnapshot().appLanguage;
  return locale === 'en' ? input.en : input.ko;
}

export function notifyAppToast(payload: AppToastPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(APP_TOAST_EVENT, {
      detail: {
        id: payload.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tone: payload.tone ?? 'success',
        durationMs: payload.durationMs ?? 3200,
        ...payload
      } satisfies Required<
        Pick<AppToastPayload, 'id' | 'message' | 'tone' | 'durationMs'>
      > &
        AppToastPayload
    })
  );
}

export function buildPointEarnedToast(points: number) {
  return {
    title: fallbackMessageForLocale({
      ko: '포인트 획득',
      en: 'Points Earned'
    }),
    message: fallbackMessageForLocale({
      ko: `고양이 키우기 포인트 +${points}를 획득했어요.`,
      en: `You earned +${points} cat care points.`
    }),
    tone: 'success' as const
  };
}

export function buildFeedPublishedToast(title?: string) {
  const fallbackTitle = fallbackMessageForLocale({
    ko: 'SNS 피드 업데이트',
    en: 'Feed Update'
  });

  return {
    title: title ?? fallbackTitle,
    message: fallbackMessageForLocale({
      ko: '새 SNS 피드가 자동으로 작성됐어요.',
      en: 'A new social feed post was created automatically.'
    }),
    tone: 'info' as const
  };
}
