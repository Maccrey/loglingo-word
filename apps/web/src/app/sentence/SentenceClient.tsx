'use client';

import React, { useEffect, useState } from 'react';
import { type SupportedAppLanguage } from '@wordflow/shared/types';
import { t, type AppLocale } from '../i18n';
import { BackButton } from '../../components/BackButton';
import {
  createFallbackSettings,
  readStoredSettingsSnapshot,
  USER_SETTINGS_UPDATED_EVENT
} from '../../lib/settingsStorage';

import {
  chooseSentenceBlock,
  createDemoSentenceSession,
  moveToNextSentenceStage,
  resetSentenceSession
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
  padding: 24,
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

const compactPanelStyle: Record<string, string | number> = {
  borderRadius: 16,
  padding: 22,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-pencil)',
  boxShadow: 'var(--shadow-card)',
  display: 'grid',
  gap: 14
};

function assembledBlockStyle(): Record<string, string | number> {
  return {
    borderRadius: 999,
    padding: '8px 12px',
    background: 'var(--accent-green)',
    color: 'var(--text-ink)',
    border: '1px solid var(--border-pencil)',
    fontWeight: 700,
    boxShadow: 'var(--shadow-card)'
  };
}

type SentenceClientProps = {
  locale?: AppLocale;
};

function renderGoalSegments(input: {
  currentSegments: string[];
  segmentBlockIndexes: number[];
  assembledCount: number;
}) {
  return (
    <>
      {input.currentSegments.map((segment, index) => {
        const blockIndex = input.segmentBlockIndexes[index] ?? index;
        const isSelected = blockIndex < input.assembledCount;
        const isNext = blockIndex === input.assembledCount;

        return (
          <span
            key={`${index}-${segment}`}
            style={{
              color: isNext
                ? '#1565c0'
                : isSelected
                  ? '#2d7a4d'
                  : 'var(--text-ink)'
            }}
          >
            {segment}
          </span>
        );
      })}
    </>
  );
}

export default function SentenceClient(props: SentenceClientProps) {
  const [session, setSession] = useState(() =>
    createDemoSentenceSession({
      appLanguage: createFallbackSettings().appLanguage,
      learningLanguage: createFallbackSettings().learningLanguage,
      learningLevel: createFallbackSettings().learningLevel,
      randomizeChoices: false,
      randomizeExercise: false
    })
  );
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [exerciseInfoCollapsed, setExerciseInfoCollapsed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [appLanguage, setAppLanguage] = useState<SupportedAppLanguage>(
    createFallbackSettings().appLanguage
  );
  const locale = props.locale ?? 'ko';
  const currentStage = session.exercise.stages[session.currentStageIndex] ?? null;
  const localizedGoalText =
    currentStage?.goalTranslations[appLanguage]?.text ?? currentStage?.goal ?? '';
  const localizedGoalSegments =
    currentStage?.goalTranslations[appLanguage]?.segments ?? currentStage?.goalSegments ?? [];
  const localizedGoalSegmentBlockIndexes =
    currentStage?.goalTranslations[appLanguage]?.segmentBlockIndexes ??
    currentStage?.goalSegments.map((_, index) => index) ??
    [];

  useEffect(() => {
    function syncFromStoredSettings() {
      const nextSettings = readStoredSettingsSnapshot();
      setAppLanguage(nextSettings.appLanguage);
      setSession(
        createDemoSentenceSession({
          appLanguage: nextSettings.appLanguage,
          learningLanguage: nextSettings.learningLanguage,
          learningLevel: nextSettings.learningLevel,
          randomizeChoices: true,
          randomizeExercise: true
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
    const timeoutId = window.setTimeout(() => {
      setHeaderCollapsed(true);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setExerciseInfoCollapsed(true);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;
  const elapsedLabel =
    locale === 'en'
      ? `Study Time ${String(elapsedMinutes).padStart(2, '0')}:${String(
          remainingSeconds
        ).padStart(2, '0')}`
      : `학습시간 ${String(elapsedMinutes).padStart(2, '0')}:${String(
          remainingSeconds
        ).padStart(2, '0')}`;

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section
          style={{
            ...panelStyle,
            display: 'grid',
            gap: headerCollapsed ? 0 : 16,
            padding: headerCollapsed ? '6px 12px' : '28px 32px',
            minHeight: headerCollapsed ? 36 : 200,
            transition: 'padding 0.45s ease, gap 0.45s ease, min-height 0.45s ease'
          }}
        >
          <div
            style={{
              overflow: 'hidden',
              maxHeight: headerCollapsed ? 0 : 132,
              opacity: headerCollapsed ? 0 : 1,
              transform: headerCollapsed ? 'translateY(-10px)' : 'translateY(0)',
              transition:
                'max-height 0.55s ease, opacity 0.4s ease, transform 0.4s ease',
              display: 'grid',
              gap: 8
            }}
          >
            <div
              style={{
                ...badgeStyle,
                padding: '6px 12px',
                fontSize: 13
              }}
            >
              {t(locale, 'sentence.title')}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.7rem, 3.8vw, 2.4rem)',
                lineHeight: 1.15,
                transition: 'font-size 0.45s ease'
              }}
            >
              {t(locale, 'sentence.heading')}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 680,
                lineHeight: 1.45,
                color: 'var(--text-faded)',
                fontSize: 13,
                transition: 'font-size 0.45s ease'
              }}
            >
              {t(locale, 'sentence.description')}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              minHeight: headerCollapsed ? 22 : 0
            }}
          >
            <BackButton locale={locale} compact={headerCollapsed} />
            <span
              style={{
                color: 'var(--text-faded)',
                fontSize: headerCollapsed ? 12 : 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                opacity: headerCollapsed ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              {elapsedLabel}
            </span>
          </div>
        </section>

        <section
          style={{
            ...panelStyle,
            display: 'grid',
            gap: exerciseInfoCollapsed ? 8 : 16,
            padding: exerciseInfoCollapsed ? '14px 18px' : 24,
            minHeight: exerciseInfoCollapsed ? 88 : 156,
            transition:
              'padding 0.35s ease, gap 0.35s ease, min-height 0.35s ease'
          }}
          onMouseEnter={() => setExerciseInfoCollapsed(false)}
          onMouseLeave={() => setExerciseInfoCollapsed(true)}
        >
          <h2 style={{ margin: 0 }}>{session.exercise.title}</h2>
          {currentStage ? (
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              문제 {session.currentStageIndex + 1} / {session.exercise.stages.length}
            </p>
          ) : null}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: exerciseInfoCollapsed ? 0 : 96,
              opacity: exerciseInfoCollapsed ? 0 : 1,
              transform: exerciseInfoCollapsed
                ? 'translateY(-8px)'
                : 'translateY(0)',
              transition:
                'max-height 0.35s ease, opacity 0.25s ease, transform 0.25s ease',
              display: 'grid',
              gap: 10
            }}
          >
            <span style={badgeStyle}>{t(locale, 'sentence.title')}</span>
            <p style={{ margin: 0, color: 'var(--text-faded)', lineHeight: 1.6 }}>
              {session.exercise.description}
            </p>
            {currentStage ? (
              <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                현재 포인트: {currentStage.focus}
              </p>
            ) : null}
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
          {session.feedback.advice ? (
            <p style={{ margin: 0, color: 'var(--text-faded)', lineHeight: 1.6 }}>
              {session.feedback.advice}
            </p>
          ) : null}
        </section>

        <section
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)'
          }}
        >
          <section style={compactPanelStyle}>
            <span style={badgeStyle}>{t(locale, 'sentence.assembled')}</span>
            {currentStage ? (
              <div style={{ display: 'grid', gap: 4, minHeight: 48, alignContent: 'start' }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: 'var(--text-faded)'
                  }}
                >
                  {currentStage.title} · {currentStage.focus}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--text-ink)',
                    lineHeight: 1.5,
                    fontWeight: 800
                  }}
                >
                  목표 문장:{' '}
                  {renderGoalSegments({
                    currentSegments: localizedGoalSegments,
                    segmentBlockIndexes: localizedGoalSegmentBlockIndexes,
                    assembledCount: session.assembledBlocks.length
                  })}
                </p>
              </div>
            ) : null}
            <div
              style={{
                minHeight: 108,
                borderRadius: 18,
                padding: 14,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                alignItems: 'center',
                background: 'transparent',
                border: '1px dashed var(--border-pencil)'
              }}
            >
              {session.assembledBlocks.length > 0 ? (
                session.assembledBlocks.map((block) => (
                  <div key={block.id} style={assembledBlockStyle()}>
                    {block.text}
                  </div>
                ))
              ) : (
                <span style={{ color: 'var(--text-faded)', fontSize: 14 }}>
                  {t(locale, 'sentence.input_placeholder')}
                </span>
              )}
            </div>
          </section>

          <section style={compactPanelStyle}>
            <span style={badgeStyle}>{t(locale, 'sentence.next_step')}</span>
            {session.completed ? (
              <div
                style={{
                  minHeight: 220,
                  display: 'grid',
                  alignContent: 'start',
                  gap: 8
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.7 }}>
                  {t(locale, 'sentence.completed')}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  minHeight: 220,
                  alignContent: 'start'
                }}
              >
                <p style={{ margin: 0, color: 'var(--text-faded)', fontSize: 14 }}>
                  3개 보기 중 다음에 올 블록을 고르세요.
                </p>
                {session.availableChoices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() =>
                      setSession((current) =>
                        chooseSentenceBlock(current, choice.id)
                      )
                    }
                    style={{
                      border: '1px solid var(--border-pencil)',
                      borderRadius: 16,
                      minHeight: 48,
                      padding: '12px 14px',
                      fontSize: 15,
                      fontWeight: 700,
                      textAlign: 'left',
                      background: 'rgba(255,255,255,0.92)',
                      color: 'var(--text-ink)',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-card)'
                    }}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 44 }}>
              {session.stageCompleted && !session.completed ? (
                <button
                  type="button"
                  onClick={() =>
                    setSession((current) => moveToNextSentenceStage(current))
                  }
                  style={{
                    border: '1px solid var(--btn-primary-border)',
                    borderRadius: 999,
                    padding: '10px 18px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: 'var(--btn-primary-bg)',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  {t(locale, 'sentence.next_question')}
                </button>
              ) : null}
              {session.completed ? (
                <button
                  type="button"
                  onClick={() =>
                    setSession((current) => resetSentenceSession(current))
                  }
                  style={{
                    border: '1px solid var(--btn-primary-border)',
                    borderRadius: 999,
                    padding: '10px 18px',
                    fontSize: 15,
                    fontWeight: 700,
                    background: 'var(--btn-primary-bg)',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  {t(locale, 'sentence.next_sentence')}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setSession((current) => resetSentenceSession(current))
                }
                style={{
                  border: '1px solid var(--border-pencil)',
                  borderRadius: 999,
                  padding: '10px 18px',
                  fontSize: 15,
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
        </section>

        {session.completedStages.length > 0 ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
            <span style={badgeStyle}>{t(locale, 'sentence.structure')}</span>
            <div style={{ display: 'grid', gap: 8 }}>
              {session.completedStages.map((stage) => (
                <p key={stage.stageId} style={{ margin: 0, lineHeight: 1.7 }}>
                  {stage.text}
                </p>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
