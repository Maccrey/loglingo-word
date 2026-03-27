'use client';

import React, { useEffect, useState } from 'react';
import { t, type AppLocale } from '../i18n';
import { BackButton } from '../../components/BackButton';
import { readStoredSettingsSnapshot } from '../../lib/settingsStorage';

import {
  advanceQuizQuestion,
  createDemoQuizSession,
  enableQuizAdvance,
  selectQuizOption,
  submitMultipleChoiceAnswer,
  submitShortAnswer,
  updateShortAnswerInput
} from './quizSession';

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

type QuizClientProps = {
  locale?: AppLocale;
};

export default function QuizClient(props: QuizClientProps) {
  const storedSettings = readStoredSettingsSnapshot();
  const [session, setSession] = useState(() =>
    createDemoQuizSession({
      learningLanguage: storedSettings.learningLanguage,
      learningLevel: storedSettings.learningLevel,
      questionCount: storedSettings.sessionQuestionCount
    })
  );
  const locale = props.locale ?? 'ko';
  const progressLabel = `${Math.min(
    session.currentQuestionIndex + 1,
    session.questionWordIds.length
  )} / ${session.questionWordIds.length}`;
  const submitButtonLabel = session.advanceReady
    ? '다음'
    : session.feedback.status === 'success'
      ? '정답'
      : null;

  useEffect(() => {
    if (session.completed) {
      return;
    }

    if (session.feedback.status === 'success' && !session.advanceReady) {
      const timer = window.setTimeout(() => {
        setSession((current) => enableQuizAdvance(current));
      }, 1500);

      return () => window.clearTimeout(timer);
    }

    if (session.feedback.status === 'error' && session.wrongAttempts >= 2) {
      const timer = window.setTimeout(() => {
        setSession((current) =>
          advanceQuizQuestion(current, {
            learningLanguage: storedSettings.learningLanguage,
            learningLevel: storedSettings.learningLevel
          })
        );
      }, 1500);

      return () => window.clearTimeout(timer);
    }
  }, [
    session.advanceReady,
    session.completed,
    session.feedback.status,
    session.wrongAttempts,
    storedSettings.learningLanguage,
    storedSettings.learningLevel
  ]);

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
          <BackButton locale={locale} />
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={{ color: 'var(--text-faded)' }}>진행 {progressLabel}</span>
          <span style={badgeStyle}>{t(locale, 'quiz.multiple_choice')}</span>
          <h2 style={{ margin: 0 }}>
            {session.completed
              ? '퀴즈를 모두 완료했습니다.'
              : session.multipleChoiceQuiz.prompt}
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {!session.completed &&
              session.multipleChoiceQuiz.options.map((option) => {
              const selected = session.selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={session.advanceReady}
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
                      : 'transparent',
                    color: 'var(--text-ink)',
                    cursor: session.advanceReady ? 'default' : 'pointer',
                    opacity: session.advanceReady ? 0.75 : 1
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
              if (session.advanceReady) {
                setSession((current) =>
                  advanceQuizQuestion(current, {
                    learningLanguage: storedSettings.learningLanguage,
                    learningLevel: storedSettings.learningLevel
                  })
                );
                return;
              }

              setSession((current) => ({ ...current, loading: true }));
              setSession((current) => ({
                ...submitMultipleChoiceAnswer(current),
                loading: false
              }));
            }}
            disabled={session.completed}
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
            {submitButtonLabel ??
              (session.loading
                ? t(locale, 'common.status.loading')
                : t(locale, 'quiz.submit_multiple'))}
          </button>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={badgeStyle}>{t(locale, 'quiz.short_answer')}</span>
          <h2 style={{ margin: 0 }}>{t(locale, 'quiz.short_answer')}</h2>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: 'var(--text-faded)' }}>
              뜻: {session.completed ? '-' : session.multipleChoiceQuiz.word.meaning}
            </span>
            <input
              aria-label="주관식 정답"
              disabled={session.completed || session.advanceReady}
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
                background: 'transparent',
                color: 'var(--text-ink)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              if (session.advanceReady) {
                setSession((current) =>
                  advanceQuizQuestion(current, {
                    learningLanguage: storedSettings.learningLanguage,
                    learningLevel: storedSettings.learningLevel
                  })
                );
                return;
              }

              setSession((current) => ({ ...current, loading: true }));
              setSession((current) => ({
                ...submitShortAnswer(current),
                loading: false
              }));
            }}
            disabled={session.completed}
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
            {submitButtonLabel ??
              (session.loading
                ? t(locale, 'common.status.loading')
                : t(locale, 'quiz.submit_short'))}
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
