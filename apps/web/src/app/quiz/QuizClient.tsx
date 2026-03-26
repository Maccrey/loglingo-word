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
  background: 'linear-gradient(180deg, #f8eedf 0%, #ffd8b6 18%, #143042 100%)',
  color: '#f9f5ef'
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
  background: 'rgba(12, 20, 31, 0.76)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 80px rgba(6, 10, 16, 0.28)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '8px 14px',
  background: 'rgba(255, 245, 215, 0.15)',
  color: '#ffd699',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

function feedbackColor(status: 'idle' | 'success' | 'error'): string {
  if (status === 'success') {
    return '#d5ff74';
  }

  if (status === 'error') {
    return '#ff9f8f';
  }

  return 'rgba(249, 245, 239, 0.72)';
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
                color: 'rgba(249, 245, 239, 0.8)'
              }}
            >
              {t(locale, 'quiz.description')}
            </p>
          </div>
          <Link href="/learn" style={{ color: '#ffd699' }}>
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
                    borderRadius: 18,
                    border: selected
                      ? '2px solid #ffd699'
                      : '1px solid rgba(255,255,255,0.12)',
                    padding: '16px 18px',
                    textAlign: 'left',
                    background: selected
                      ? 'rgba(255, 214, 153, 0.18)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#f9f5ef',
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
              border: 0,
              borderRadius: 18,
              padding: '16px 18px',
              fontSize: 16,
              fontWeight: 700,
              background: '#ffd699',
              color: '#2d1b0e',
              cursor: 'pointer'
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
            <span style={{ color: 'rgba(249, 245, 239, 0.72)' }}>
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
                border: '1px solid rgba(255,255,255,0.18)',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.06)',
                color: '#f9f5ef'
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
              border: 0,
              borderRadius: 18,
              padding: '16px 18px',
              fontSize: 16,
              fontWeight: 700,
              background: '#8ce7ff',
              color: '#0f2231',
              cursor: 'pointer'
            }}
          >
            {session.loading
              ? t(locale, 'common.status.loading')
              : t(locale, 'quiz.submit_short')}
          </button>

          {session.shortAnswerGrade ? (
            <p style={{ margin: 0, color: 'rgba(249, 245, 239, 0.72)' }}>
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
