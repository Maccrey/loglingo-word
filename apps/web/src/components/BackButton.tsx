import Link from 'next/link';
import { t, type AppLocale } from '../app/i18n';

type BackButtonProps = {
  locale?: AppLocale;
};

export function BackButton({ locale = 'ko' }: BackButtonProps) {
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
        marginBottom: 16,
        width: 'fit-content'
      }}
    >
      <span aria-hidden="true">←</span>
      <span>{t(locale, 'common.action.back_home')}</span>
    </Link>
  );
}
