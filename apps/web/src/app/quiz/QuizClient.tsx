'use client';

import React, { useEffect, useState } from 'react';
import { t, type AppLocale } from '../i18n';
import { CollapsiblePageHeader } from '../../components/CollapsiblePageHeader';
import {
  createFallbackSettings,
  readStoredSettingsSnapshot,
  USER_SETTINGS_UPDATED_EVENT
} from '../../lib/settingsStorage';

import {
  advanceQuizQuestion,
  createDemoQuizSession,
  finishReviewRound,
  selectQuizOption,
  selectReviewAnswer,
  selectReviewPrompt,
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

type QuizMode = 'multiple' | 'short';

function readingLabel(locale: AppLocale): string {
  return locale === 'en' ? 'Pronunciation' : '발음';
}

export default function QuizClient(props: QuizClientProps) {
  const [storedSettings, setStoredSettings] = useState(() =>
    createFallbackSettings()
  );
  const [session, setSession] = useState(() =>
    createDemoQuizSession({
      learningLanguage: createFallbackSettings().learningLanguage,
      learningLevel: createFallbackSettings().learningLevel,
      questionCount: createFallbackSettings().sessionQuestionCount,
      randomizeQuestions: false
    })
  );
  const [mode, setMode] = useState<QuizMode>('multiple');
  const locale = props.locale ?? 'ko';
  const progressCurrent = session.reviewRound
    ? session.currentQuestionIndex
    : Math.min(session.currentQuestionIndex + 1, session.baseQuestionWordIds.length);
  const progressLabel = `${progressCurrent} / ${session.baseQuestionWordIds.length}`;
  const interactionLocked =
    session.completed ||
    Boolean(session.reviewRound?.completed) ||
    session.feedback.status === 'success' ||
    (session.feedback.status === 'error' && session.wrongAttempts >= 2);

  useEffect(() => {
    function syncFromStoredSettings() {
      const nextSettings = readStoredSettingsSnapshot();
      setStoredSettings(nextSettings);
      setSession(
        createDemoQuizSession({
          learningLanguage: nextSettings.learningLanguage,
          learningLevel: nextSettings.learningLevel,
          questionCount: nextSettings.sessionQuestionCount,
          randomizeQuestions: true
        })
      );
    }

    syncFromStoredSettings();
    window.addEventListener(USER_SETTINGS_UPDATED_EVENT, syncFromStoredSettings);

    return () => {
      window.removeEventListener(
        USER_SETTINGS_UPDATED_EVENT,
        syncFromStoredSettings
      );
    };
  }, []);

  useEffect(() => {
    if (session.reviewRound?.completed) {
      const timer = window.setTimeout(() => {
        setSession((current) => finishReviewRound(current));
      }, 1200);

      return () => window.clearTimeout(timer);
    }

    if (session.completed) {
      return;
    }

    if (session.feedback.status === 'success' && !session.reviewRound) {
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
    session.completed,
    session.feedback.status,
    session.wrongAttempts,
    session.reviewRound,
    storedSettings.learningLanguage,
    storedSettings.learningLevel
  ]);

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <CollapsiblePageHeader locale={locale}>
          <div style={{ display: 'grid', gap: 14 }}>
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
          </div>
        </CollapsiblePageHeader>

        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <span style={{ color: 'var(--text-faded)' }}>진행 {progressLabel}</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {([
              ['multiple', t(locale, 'quiz.multiple_choice')],
              ['short', t(locale, 'quiz.short_answer')]
            ] as const).map(([value, label]) => {
              const active = mode === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={active}
                  style={{
                    borderRadius: 999,
                    border: active
                      ? '1px solid var(--text-ink)'
                      : '1px solid var(--border-pencil)',
                    padding: '10px 16px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: active ? 'var(--accent-yellow)' : 'transparent',
                    color: 'var(--text-ink)',
                    cursor: 'pointer',
                    boxShadow: active ? 'var(--shadow-card)' : 'none'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {session.reviewRound ? (
            <>
              <span style={badgeStyle}>통합 퀴즈</span>
              <div
                style={{
                  display: 'grid',
                  gap: 18,
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  alignItems: 'start'
                }}
              >
                <div style={{ display: 'grid', gap: 10 }}>
                  <h2 style={{ margin: 0 }}>왼쪽 블록</h2>
                  {session.reviewRound.leftWordIds.map((wordId, index) => {
                    const pair = session.reviewRound?.pairs.find(
                      (item) => item.wordId === wordId
                    );
                    const matched = session.reviewRound?.matchedWordIds.includes(wordId);
                    const selected = session.reviewRound?.selectedLeftWordId === wordId;

                    return (
                      <button
                        key={`left-${wordId}`}
                        type="button"
                        disabled={matched || session.reviewRound?.completed}
                        onClick={() =>
                          setSession((current) => selectReviewPrompt(current, wordId))
                        }
                        style={{
                          borderRadius: 16,
                          border: selected
                            ? '2px solid #1565c0'
                            : '1px solid var(--border-pencil)',
                          padding: '16px 18px',
                          textAlign: 'left',
                          background: matched
                            ? '#cfeecf'
                            : selected
                              ? '#dbeafe'
                              : 'transparent',
                          color: 'var(--text-ink)',
                          cursor: matched ? 'default' : 'pointer',
                          opacity: matched ? 0.8 : 1
                        }}
                      >
                        <span style={{ display: 'grid', gap: 4 }}>
                          <span>
                            {index + 1}. {pair?.leftText}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <h2 style={{ margin: 0 }}>오른쪽 답</h2>
                  {session.reviewRound.rightWordIds.map((wordId, index) => {
                    const pair = session.reviewRound?.pairs.find(
                      (item) => item.wordId === wordId
                    );
                    const matched = session.reviewRound?.matchedWordIds.includes(wordId);

                    return (
                      <button
                        key={`right-${wordId}`}
                        type="button"
                        disabled={matched || session.reviewRound?.completed}
                        onClick={() =>
                          setSession((current) => selectReviewAnswer(current, wordId))
                        }
                        style={{
                          borderRadius: 16,
                          border: matched
                            ? '1px solid #2d7a4d'
                            : '1px solid var(--border-pencil)',
                          padding: '16px 18px',
                          textAlign: 'left',
                          background: matched ? '#cfeecf' : 'transparent',
                          color: 'var(--text-ink)',
                          cursor: matched ? 'default' : 'pointer',
                          opacity: matched ? 0.8 : 1
                        }}
                      >
                        {index + 1}. {pair?.rightText}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : mode === 'multiple' ? (
            <>
              <span style={badgeStyle}>{t(locale, 'quiz.multiple_choice')}</span>
              {session.completed ? (
                <div style={{ display: 'grid', gap: 14 }}>
                  <h2 style={{ margin: 0 }}>퀴즈를 모두 완료했습니다.</h2>
                  <button
                    type="button"
                    onClick={() =>
                      setSession(
                        createDemoQuizSession({
                          learningLanguage: storedSettings.learningLanguage,
                          learningLevel: storedSettings.learningLevel,
                          questionCount: storedSettings.sessionQuestionCount,
                          randomizeQuestions: true
                        })
                      )
                    }
                    style={{
                      width: 'fit-content',
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
                    다음 10문제
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: 18,
                    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 1fr)',
                    alignItems: 'start'
                  }}
                >
                  <div
                    style={{
                      borderRadius: 18,
                      padding: 20,
                      border: '1px solid var(--border-pencil)',
                      background: 'rgba(255,255,255,0.6)',
                      minHeight: 180,
                      display: 'grid',
                      alignContent: 'start',
                      gap: 12
                    }}
                  >
                    <span style={{ color: 'var(--text-faded)', fontWeight: 700 }}>
                      새 문제
                    </span>
                    <h2 style={{ margin: 0 }}>{session.multipleChoiceQuiz.prompt}</h2>
                    {session.multipleChoiceQuiz.word.reading ? (
                      <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                        {readingLabel(locale)}: {session.multipleChoiceQuiz.word.reading}
                      </p>
                    ) : null}
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {session.multipleChoiceQuiz.options.map((option) => {
                      const selected = session.selectedOptionId === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={interactionLocked}
                          onClick={() =>
                            setSession((current) => {
                              const selected = selectQuizOption(current, option.id);
                              return submitMultipleChoiceAnswer(selected);
                            })
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
                            cursor: interactionLocked ? 'default' : 'pointer',
                            opacity: interactionLocked ? 0.75 : 1
                          }}
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <span style={badgeStyle}>{t(locale, 'quiz.short_answer')}</span>
              <h2 style={{ margin: 0 }}>{t(locale, 'quiz.short_answer')}</h2>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: 'var(--text-faded)' }}>
                  뜻: {session.completed ? '-' : session.multipleChoiceQuiz.word.meaning}
                </span>
                {!session.completed && session.multipleChoiceQuiz.word.reading ? (
                  <span style={{ color: 'var(--text-faded)' }}>
                    {readingLabel(locale)}: {session.multipleChoiceQuiz.word.reading}
                  </span>
                ) : null}
                <input
                  aria-label="주관식 정답"
                  disabled={interactionLocked}
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
                  setSession((current) => ({ ...current, loading: true }));
                  setSession((current) => ({
                    ...submitShortAnswer(current),
                    loading: false
                  }));
                }}
                disabled={interactionLocked}
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
                {session.feedback.status === 'success'
                  ? '정답'
                  : session.loading
                    ? t(locale, 'common.status.loading')
                    : t(locale, 'quiz.submit_short')}
              </button>

              {session.shortAnswerGrade ? (
                <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                  오타 거리 {session.shortAnswerGrade.distance} / 허용{' '}
                  {session.shortAnswerGrade.allowedTypos}
                </p>
              ) : null}
            </>
          )}
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
