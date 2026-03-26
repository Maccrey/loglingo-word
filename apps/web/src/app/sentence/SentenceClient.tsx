'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { t, type AppLocale } from '../i18n';

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
  background: 'linear-gradient(180deg, #eef5d7 0%, #a1d7c1 20%, #113347 100%)',
  color: '#f4f7f1'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 24
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 28,
  padding: 24,
  background: 'rgba(12, 20, 31, 0.78)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 80px rgba(6, 10, 16, 0.28)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '8px 14px',
  background: 'rgba(199, 255, 228, 0.14)',
  color: '#b7f8db',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

function tokenStyle(active: boolean): Record<string, string | number> {
  return {
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '12px 16px',
    background: active ? 'rgba(183, 248, 219, 0.16)' : 'rgba(255,255,255,0.06)',
    color: '#f4f7f1',
    cursor: 'pointer'
  };
}

export default function SentenceClient() {
  const [session, setSession] = useState(createDemoSentenceSession);
  const locale: AppLocale = 'ko';

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
              color: 'rgba(244, 247, 241, 0.8)'
            }}
          >
            {t(locale, 'sentence.description')}
          </p>
          <Link href="/quiz" style={{ color: '#b7f8db' }}>
            {t(locale, 'quiz.title')}
          </Link>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'sentence.title')}</span>
          <h2 style={{ margin: 0 }}>{session.exercise.prompt}</h2>
          <p style={{ margin: 0, color: 'rgba(244, 247, 241, 0.72)' }}>
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
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.2)'
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
              <span style={{ color: 'rgba(244, 247, 241, 0.56)' }}>
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
                border: 0,
                borderRadius: 18,
                padding: '16px 18px',
                fontSize: 16,
                fontWeight: 700,
                background: '#b7f8db',
                color: '#123128',
                cursor: 'pointer'
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
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: 18,
                padding: '16px 18px',
                fontSize: 16,
                fontWeight: 700,
                background: 'transparent',
                color: '#f4f7f1',
                cursor: 'pointer'
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
                  ? '#d5ff74'
                  : session.feedback.status === 'error'
                    ? '#ff9f8f'
                    : 'rgba(244, 247, 241, 0.72)'
            }}
          >
            {session.feedback.message}
          </p>
          {session.result && !session.result.isCorrect ? (
            <p style={{ margin: 0, color: 'rgba(244, 247, 241, 0.68)' }}>
              누락 토큰: {session.result.missingTokens.join(', ') || '없음'}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
