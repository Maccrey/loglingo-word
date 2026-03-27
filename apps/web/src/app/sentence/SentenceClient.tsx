'use client';

import React, { useState } from 'react';
import { t, type AppLocale } from '../i18n';
import { BackButton } from '../../components/BackButton';
import { readStoredSettingsSnapshot } from '../../lib/settingsStorage';

import {
  createDemoSentenceSession,
  moveTokenBackToPool,
  moveTokenToAnswer,
  resetSentenceSession,
  submitSentenceSession
} from './sentenceSession';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'transparent',
  color: 'var(--text-ink)'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 32
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 16,
  padding: 32,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-pencil)',
  boxShadow: 'var(--shadow-card)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '6px 12px',
  background: 'var(--accent-green)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
};

function tokenStyle(active: boolean): Record<string, string | number> {
  return {
    borderRadius: 999,
    border: '1px solid var(--border-pencil)',
    padding: '12px 16px',
    background: active ? 'var(--accent-green)' : 'var(--bg-card)',
    color: 'var(--text-ink)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-card)'
  };
}

type SentenceClientProps = {
  locale?: AppLocale;
};

export default function SentenceClient(props: SentenceClientProps) {
  const storedSettings = readStoredSettingsSnapshot();
  const [session, setSession] = useState(() =>
    createDemoSentenceSession({
      learningLanguage: storedSettings.learningLanguage,
      learningLevel: storedSettings.learningLevel
    })
  );
  const locale = props.locale ?? 'ko';

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'sentence.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'sentence.heading')}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 620,
              lineHeight: 1.6,
              color: 'var(--text-faded)'
            }}
          >
            {t(locale, 'sentence.description')}
          </p>
          <BackButton locale={locale} />
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'sentence.title')}</span>
          <h2 style={{ margin: 0 }}>{session.exercise.prompt}</h2>
          <p style={{ margin: 0, color: 'var(--text-faded)' }}>
            뜻: {session.exercise.word.meaning}
          </p>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'sentence.token_pool')}</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {session.poolTokens.map((token) => (
              <button
                key={token.id}
                type="button"
                onClick={() =>
                  setSession((current) => moveTokenToAnswer(current, token.id))
                }
                style={tokenStyle(false)}
              >
                {token.value}
              </button>
            ))}
          </div>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'sentence.assembled')}</span>
          <div
            style={{
              minHeight: 96,
              borderRadius: 22,
              padding: 18,
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
              background: 'transparent',
              border: '1px dashed var(--border-pencil)'
            }}
          >
            {session.assembledTokens.length > 0 ? (
              session.assembledTokens.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  onClick={() =>
                    setSession((current) =>
                      moveTokenBackToPool(current, token.id)
                    )
                  }
                  style={tokenStyle(true)}
                >
                  {token.value}
                </button>
              ))
            ) : (
              <span style={{ color: 'var(--text-faded)' }}>
                {t(locale, 'sentence.description')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() =>
                setSession((current) => submitSentenceSession(current))
              }
              style={{
                border: '1px solid var(--btn-primary-border)',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 700,
                background: 'var(--btn-primary-bg)',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'sentence.submit')}
            </button>
            <button
              type="button"
              onClick={() =>
                setSession((current) => resetSentenceSession(current))
              }
              style={{
                border: '1px solid var(--border-pencil)',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                background: 'transparent',
                color: 'var(--text-ink)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'common.action.reset')}
            </button>
          </div>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 10 }}>
          <span style={badgeStyle}>{t(locale, 'sentence.result')}</span>
          <p
            role="alert"
            style={{
              margin: 0,
              color:
                session.feedback.status === 'success'
                  ? '#2d7a4d'
                  : session.feedback.status === 'error'
                    ? '#d32f2f'
                    : 'var(--text-faded)'
            }}
          >
            {session.feedback.message}
          </p>
          {session.result && !session.result.isCorrect ? (
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              누락 토큰: {session.result.missingTokens.join(', ') || '없음'}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
