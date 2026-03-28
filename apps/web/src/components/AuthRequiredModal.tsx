'use client';

import React from 'react';

import { t, type AppLocale } from '../app/i18n';

type AuthRequiredModalProps = {
  locale: AppLocale;
  title?: string;
  description?: string;
  onLogin: () => void;
};

export function AuthRequiredModal(props: AuthRequiredModalProps) {
  const locale = props.locale;

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
        zIndex: 1000
      }}
    >
      <section
        style={{
          width: 'min(92vw, 460px)',
          borderRadius: 20,
          padding: 24,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-pencil)',
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gap: 14
        }}
      >
        <strong style={{ fontSize: 22 }}>
          {props.title ?? t(locale, 'auth.required_title')}
        </strong>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-faded)' }}>
          {props.description ?? t(locale, 'auth.required_description')}
        </p>
        <button
          type="button"
          onClick={props.onLogin}
          style={{
            width: 'fit-content',
            border: '1px solid var(--border-pencil)',
            borderRadius: 999,
            padding: '12px 24px',
            background: '#fff',
            color: 'var(--text-ink)',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {t(locale, 'settings.google_login')}
        </button>
      </section>
    </div>
  );
}
