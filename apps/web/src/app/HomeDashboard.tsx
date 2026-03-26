'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  calculateDailyGoal,
  calculateLevelProgress,
  calculateRewardPoints,
  updateLearningStreak
} from '@wordflow/core/gamification';
import { buildReviewSelection } from '@wordflow/core/memory';
import { type UserDashboardStats } from '@wordflow/shared/types';
import { t, type AppLocale } from './i18n';

type HomeDashboardProps = {
  loading?: boolean;
  locale?: AppLocale;
  pendingSource?: string;
  pendingPoints?: string;
  pendingLeaderboardScore?: string;
  initialStats?: UserDashboardStats | null;
};

type RecommendationState = {
  words: string[];
  requestedAt?: string;
  weekId?: string;
  loading: boolean;
  error?: string;
};

type SyncState = {
  loading: boolean;
  synced: boolean;
};

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'transparent',
  color: 'var(--text-ink)'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 1040,
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

function buildDashboardState() {
  const rewards = calculateRewardPoints([
    { type: 'lesson_complete', awardId: 'lesson-2026-03-25' },
    { type: 'correct_streak', awardId: 'streak-2026-03-25', value: 3 },
    { type: 'quest_complete', awardId: 'quest-2026-03-25' }
  ]);
  const streak = updateLearningStreak(
    {
      currentStreak: 4,
      lastLearnedOn: '2026-03-24'
    },
    '2026-03-25T09:00:00.000Z'
  );
  const dailyGoal = calculateDailyGoal(7, 10);
  const level = calculateLevelProgress(rewards.ledger.totalPoints + 135);
  const reviewSelection = buildReviewSelection({
    now: '2026-03-25T12:00:00.000Z',
    progress: [
      {
        wordId: 'subway',
        correctStreak: 2,
        storageStrength: 1.1,
        retrievalStrength: 1,
        nextReviewAt: '2026-03-25T08:00:00.000Z'
      },
      {
        wordId: 'passport',
        correctStreak: 1,
        storageStrength: 0.5,
        retrievalStrength: 0.4,
        nextReviewAt: '2026-03-24T00:00:00.000Z'
      }
    ],
    limit: 4,
    reviewShare: 0.5
  });

  return {
    points: rewards.ledger.totalPoints,
    streak,
    dailyGoal,
    level,
    reviewSelection
  };
}

function parsePositiveInteger(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

export default function HomeDashboard(props: HomeDashboardProps) {
  const {
    loading = false,
    locale = 'ko',
    pendingSource,
    pendingPoints,
    pendingLeaderboardScore,
    initialStats = null
  } = props;
  const dashboard = buildDashboardState();
  const pendingPointsValue =
    pendingSource === 'recommendation'
      ? parsePositiveInteger(pendingPoints)
      : 0;
  const pendingLeaderboardValue =
    pendingSource === 'recommendation'
      ? parsePositiveInteger(pendingLeaderboardScore)
      : 0;
  const basePoints = initialStats?.totalPoints ?? dashboard.points;
  const totalPoints = basePoints + pendingPointsValue;
  const totalLevel = calculateLevelProgress(totalPoints + 135);
  const [recommendation, setRecommendation] = useState<RecommendationState>({
    words: [],
    loading: false
  });
  const [syncState, setSyncState] = useState<SyncState>({
    loading: false,
    synced: false
  });

  async function requestRecommendation() {
    setRecommendation((current) => ({
      ...current,
      loading: true
    }));

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'demo-user',
          nativeLanguage: locale,
          targetLanguage: locale === 'ko' ? 'en' : 'ko',
          now: '2026-03-26T00:00:00.000Z',
          fallbackWords: ['passport', 'subway', 'reservation']
        })
      });
      const result = (await response.json()) as {
        message?: string;
        recommendation?: {
          words: string[];
          requestedAt: string;
          weekId: string;
        };
      };

      if (!response.ok || !result.recommendation) {
        throw new Error(
          result.message ?? t(locale, 'home.recommendation.error')
        );
      }

      setRecommendation({
        words: result.recommendation.words,
        requestedAt: result.recommendation.requestedAt,
        weekId: result.recommendation.weekId,
        loading: false
      });
    } catch (error) {
      setRecommendation({
        words: [],
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : t(locale, 'home.recommendation.error')
      });
    }
  }

  useEffect(() => {
    if (
      pendingSource !== 'recommendation' ||
      syncState.synced ||
      syncState.loading ||
      (pendingPointsValue === 0 && pendingLeaderboardValue === 0)
    ) {
      return;
    }

    let cancelled = false;

    async function syncPendingDashboard() {
      setSyncState({
        loading: true,
        synced: false
      });

      try {
        await fetch('/api/dashboard/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: 'demo-user',
            pointsDelta: pendingPointsValue,
            leaderboardDelta: pendingLeaderboardValue,
            updatedAt: '2026-03-26T00:00:00.000Z'
          })
        });
      } finally {
        if (!cancelled) {
          setSyncState({
            loading: false,
            synced: true
          });
        }
      }
    }

    void syncPendingDashboard();

    return () => {
      cancelled = true;
    };
  }, [
    pendingLeaderboardValue,
    pendingPointsValue,
    pendingSource,
    syncState.loading,
    syncState.synced
  ]);

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'home.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'home.heading')}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 640,
              lineHeight: 1.6,
              color: 'var(--text-faded)'
            }}
          >
            {t(locale, 'home.description')}
          </p>
          {loading ? (
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              {t(locale, 'home.loading')}
            </p>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-ink)' }}>
              {t(locale, 'home.ready')}
            </p>
          )}
        </section>

        {pendingSource === 'recommendation' &&
        (pendingPointsValue > 0 || pendingLeaderboardValue > 0) ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            <div style={badgeStyle}>{t(locale, 'home.sync.title')}</div>
            <p style={{ margin: 0, color: 'var(--text-ink)', lineHeight: 1.6 }}>
              {t(locale, 'home.sync.description')} +{pendingPointsValue}pt
              {pendingLeaderboardValue > 0
                ? ` · leaderboard +${pendingLeaderboardValue}`
                : ''}
              {syncState.loading
                ? ` · ${t(locale, 'home.sync.pending').toLowerCase()}...`
                : ''}
            </p>
          </section>
        ) : null}

        <section
          data-testid="home-summary-grid"
          style={{
            display: 'grid',
            gap: 18,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          <article style={panelStyle}>
            <div style={badgeStyle}>{t(locale, 'home.summary.today')}</div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              {dashboard.reviewSelection.mixedQueue.length}
            </h2>
            <p style={{ margin: 0 }}>{t(locale, 'home.summary.today')}</p>
          </article>

          <article style={panelStyle}>
            <div style={badgeStyle}>{t(locale, 'home.summary.streak')}</div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              {dashboard.streak.currentStreak}일
            </h2>
            <p style={{ margin: 0 }}>{t(locale, 'home.summary.streak')}</p>
          </article>

          <article style={panelStyle}>
            <div style={badgeStyle}>{t(locale, 'home.summary.points')}</div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              {totalPoints} pt
            </h2>
            <p style={{ margin: 0 }}>{t(locale, 'home.summary.points')}</p>
          </article>

          <article style={panelStyle}>
            <div style={badgeStyle}>{t(locale, 'home.summary.level')}</div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              Lv. {totalLevel.level}
            </h2>
            <p style={{ margin: 0 }}>
              다음 레벨까지 {totalLevel.pointsToNextLevel}pt
            </p>
          </article>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'home.goal')}</div>
          <h2 style={{ margin: 0 }}>
            {t(locale, 'home.goal')} {dashboard.dailyGoal.completed}/
            {dashboard.dailyGoal.target}
          </h2>
          <div
            aria-label="daily-goal-progress"
            style={{
              height: 14,
              borderRadius: 999,
              background: 'var(--border-pencil)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${dashboard.dailyGoal.progressPercent}%`,
                height: '100%',
                background: 'var(--accent-green)'
              }}
            />
          </div>
          <p style={{ margin: 0 }}>
            {dashboard.dailyGoal.progressPercent}% ·{' '}
            {dashboard.dailyGoal.isComplete
              ? t(locale, 'home.goal.complete')
              : t(locale, 'home.goal.in_progress')}
          </p>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'home.recommendation.title')}</div>
          <h2 style={{ margin: 0 }}>
            {t(locale, 'home.recommendation.heading')}
          </h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {t(locale, 'home.recommendation.description')}
          </p>
          <button
            type="button"
            onClick={requestRecommendation}
            disabled={recommendation.loading}
            style={{
              width: 'fit-content',
              borderRadius: 999,
              border: '1px solid var(--btn-primary-border)',
              padding: '10px 16px',
              background: recommendation.loading
                ? 'var(--btn-disabled-bg)'
                : 'var(--btn-primary-bg)',
              color: recommendation.loading
                ? 'var(--btn-disabled-color)'
                : '#fff',
              fontWeight: 700,
              cursor: recommendation.loading ? 'progress' : 'pointer',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {recommendation.loading
              ? t(locale, 'home.recommendation.loading')
              : t(locale, 'home.recommendation.action')}
          </button>
          {recommendation.error ? (
            <p role="alert" style={{ margin: 0, color: '#d32f2f' }}>
              {recommendation.error}
            </p>
          ) : null}
          {recommendation.words.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                {t(locale, 'home.recommendation.result')}{' '}
                {recommendation.weekId}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {recommendation.words.map((word) => (
                  <span
                    key={word}
                    style={{
                      borderRadius: 999,
                      padding: '8px 12px',
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--border-pencil)',
                      boxShadow: '0 2px 4px rgba(44,42,37,0.03)'
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
              <Link
                href={`/learn?focus=${encodeURIComponent(
                  recommendation.words.join(',')
                )}`}
                style={{
                  color: 'var(--text-ink)',
                  fontWeight: 700,
                  textDecoration: 'underline'
                }}
              >
                {t(locale, 'home.recommendation.start')}
              </Link>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              {t(locale, 'home.recommendation.empty')}
            </p>
          )}
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'home.quick_start')}</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {t(locale, 'home.quick_start.description')}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/learn"
              aria-label={t(locale, 'common.action.quick_start')}
              style={{
                background: 'var(--accent-yellow)',
                border: '1px solid var(--border-pencil)',
                padding: '8px 16px',
                borderRadius: 12,
                color: 'var(--text-ink)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'common.action.quick_start')}
            </Link>
            <Link
              href="/quiz"
              aria-label={t(locale, 'quiz.title')}
              style={{
                background: 'var(--accent-green)',
                border: '1px solid var(--border-pencil)',
                padding: '8px 16px',
                borderRadius: 12,
                color: 'var(--text-ink)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'quiz.title')}
            </Link>
            <Link
              href="/sentence"
              aria-label={t(locale, 'sentence.title')}
              style={{
                background: 'var(--accent-blue)',
                border: '1px solid var(--border-pencil)',
                padding: '8px 16px',
                borderRadius: 12,
                color: 'var(--text-ink)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'sentence.title')}
            </Link>
            <Link
              href="/chat"
              aria-label={t(locale, 'chat.title')}
              style={{
                background: 'var(--accent-pink)',
                border: '1px solid var(--border-pencil)',
                padding: '8px 16px',
                borderRadius: 12,
                color: 'var(--text-ink)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'chat.title')}
            </Link>
            <Link
              href="/feed"
              aria-label={t(locale, 'feed.title')}
              style={{
                background: 'var(--accent-orange)',
                border: '1px solid var(--border-pencil)',
                padding: '8px 16px',
                borderRadius: 12,
                color: 'var(--text-ink)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'feed.title')}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
