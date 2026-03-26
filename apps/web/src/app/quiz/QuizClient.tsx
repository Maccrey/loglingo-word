'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { t, type AppLocale } from '../i18n';

import {
  createDemoQuizSession,
  selectQuizOption,
  submitMultipleChoiceAnswer,
  submitShortAnswer,
  updateShortAnswerInput
} from './quizSession';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'var(--bg-paper)',
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
  background: 'var(--accent-yellow)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
};

function feedbackColor(status: 'idle' | 'success' | 'error'): string {
  if (status === 'success') {
    return '#2d7a4d';
  }

  if (status === 'error') {
    return '#d32f2f';
  }

  return 'var(--text-faded)';
}

export default function QuizClient() {
  const [session, setSession] = useState(createDemoQuizSession);
  const locale: AppLocale = 'ko';

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'quiz.title')}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t(locale, 'quiz.heading')}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 620,
                lineHeight: 1.6,
                color: 'var(--text-faded)'
              }}
            >
              {t(locale, 'quiz.description')}
            </p>
          </div>
          <Link
            href="/learn"
            style={{ color: 'var(--text-ink)', textDecoration: 'underline' }}
          >
            {t(locale, 'learn.title')}
          </Link>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'quiz.multiple_choice')}</span>
          <h2 style={{ margin: 0 }}>{session.multipleChoiceQuiz.prompt}</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {session.multipleChoiceQuiz.options.map((option) => {
              const selected = session.selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setSession((current) =>
                      selectQuizOption(current, option.id)
                    )
                  }
                  style={{
                    borderRadius: 16,
                    border: selected
                      ? '2px solid var(--text-ink)'
                      : '1px solid var(--border-pencil)',
                    padding: '16px 18px',
                    textAlign: 'left',
                    background: selected
                      ? 'var(--accent-yellow)'
                      : 'var(--bg-paper)',
                    color: 'var(--text-ink)',
                    cursor: 'pointer'
                  }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setSession((current) => ({ ...current, loading: true }));
              setSession((current) => ({
                ...submitMultipleChoiceAnswer(current),
                loading: false
              }));
            }}
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
            {session.loading
              ? t(locale, 'common.status.loading')
              : t(locale, 'quiz.submit_multiple')}
          </button>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'quiz.short_answer')}</span>
          <h2 style={{ margin: 0 }}>{t(locale, 'quiz.short_answer')}</h2>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: 'var(--text-faded)' }}>
              뜻: {session.multipleChoiceQuiz.word.meaning}
            </span>
            <input
              aria-label="주관식 정답"
              value={session.shortAnswer}
              onChange={(event) =>
                setSession((current) =>
                  updateShortAnswerInput(current, event.target.value)
                )
              }
              placeholder={t(locale, 'quiz.title')}
              style={{
                borderRadius: 16,
                border: '1px solid var(--border-pencil)',
                padding: '14px 16px',
                background: 'var(--bg-paper)',
                color: 'var(--text-ink)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setSession((current) => ({ ...current, loading: true }));
              setSession((current) => ({
                ...submitShortAnswer(current),
                loading: false
              }));
            }}
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
            {session.loading
              ? t(locale, 'common.status.loading')
              : t(locale, 'quiz.submit_short')}
          </button>

          {session.shortAnswerGrade ? (
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              오타 거리 {session.shortAnswerGrade.distance} / 허용{' '}
              {session.shortAnswerGrade.allowedTypos}
            </p>
          ) : null}
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
          <span style={badgeStyle}>{t(locale, 'quiz.feedback')}</span>
          <p
            role="alert"
            style={{
              margin: 0,
              color: feedbackColor(session.feedback.status),
              lineHeight: 1.6
            }}
          >
            {session.feedback.message}
          </p>
        </section>
      </div>
    </main>
  );
}
