import React from 'react';
import Link from 'next/link';
import { t, type AppLocale } from '../app/i18n';

type BackButtonProps = {
  locale?: AppLocale;
  compact?: boolean;
};

export function BackButton({ locale = 'ko', compact = false }: BackButtonProps) {
  const href = locale === 'en' ? '/?locale=en' : '/';

  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-ink)',
        textDecoration: 'none',
        fontWeight: 500,
        marginBottom: compact ? 0 : 16,
        fontSize: compact ? 14 : 16,
        lineHeight: 1.2,
        width: 'fit-content'
      }}
    >
      <span aria-hidden="true">←</span>
      <span>{t(locale, 'common.action.back_home')}</span>
    </Link>
  );
}
