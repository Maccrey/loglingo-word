'use client';

import React from 'react';

import { t, type AppLocale } from '../app/i18n';

type TermsConsentModalProps = {
  locale: AppLocale;
  onAccept: () => Promise<void> | void;
};

export function TermsConsentModal(props: TermsConsentModalProps) {
  const locale = props.locale;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleAccept() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await props.onAccept();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(32, 28, 22, 0.48)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        zIndex: 1001
      }}
    >
      <section
        style={{
          width: 'min(92vw, 560px)',
          borderRadius: 20,
          padding: 24,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-pencil)',
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gap: 16
        }}
      >
        <strong style={{ fontSize: 22 }}>{t(locale, 'terms.title')}</strong>
        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-faded)' }}>
          {t(locale, 'terms.summary')}
        </p>
        <div
          style={{
            borderRadius: 16,
            padding: 16,
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-pencil)',
            display: 'grid',
            gap: 10,
            color: 'var(--text-ink)',
            lineHeight: 1.6
          }}
        >
          <span>{t(locale, 'terms.item.learning')}</span>
          <span>{t(locale, 'terms.item.storage')}</span>
          <span>{t(locale, 'terms.item.safety')}</span>
        </div>
        <button
          type="button"
          onClick={() => void handleAccept()}
          disabled={isSubmitting}
          style={{
            width: 'fit-content',
            border: '1px solid var(--btn-primary-border)',
            borderRadius: 999,
            padding: '12px 24px',
            background: 'var(--btn-primary-bg)',
            color: '#fff',
            fontWeight: 700,
            cursor: isSubmitting ? 'default' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {t(locale, 'terms.accept')}
        </button>
      </section>
    </div>
  );
}
