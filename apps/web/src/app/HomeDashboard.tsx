'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import {
  calculateDailyGoal,
  calculateLevelProgress,
  calculateRewardPoints,
  updateLearningStreak
} from '@wordflow/core/gamification';
import { buildCatStateSnapshot, getCatThresholds, type EnvThresholds } from '@wordflow/shared/cat';
import {
  type UserDashboardStats,
  type UserHomeSummary,
  userSettingsSchema
} from '@wordflow/shared/types';
import { t, type AppLocale } from './i18n';
import CatCard from '../components/CatCard';
import { useCat } from '../lib/useCat';
import {
  readStoredSettingsSnapshot,
  saveStoredSettings
} from '../lib/settingsStorage';
import { useAppAuth } from '../lib/useAppAuth';
import { TermsConsentModal } from '../components/TermsConsentModal';
import {
  loadFirebaseCurrentWeekRecommendation,
  loadFirebaseDashboardStats,
  loadFirebaseHomeSummary,
  loadFirebaseLeaderboardPreview
} from '../lib/firebase-client';

type HomeDashboardProps = {
  loading?: boolean;
  locale?: AppLocale;
  pendingSource?: string;
  pendingPoints?: string;
  pendingLeaderboardScore?: string;
  initialStats?: UserDashboardStats | null;
  leaderboardPreview?: {
    weekId: string;
    myRank: number | null;
    topEntries: Array<{
      userId: string;
      rank: number;
      score: number;
      isCurrentUser: boolean;
    }>;
  } | null;
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

type LeaderboardPreview = NonNullable<HomeDashboardProps['leaderboardPreview']>;
type HomeFirebaseState = {
  loading: boolean;
  dashboardStats: UserDashboardStats | null;
  homeSummary: UserHomeSummary | null;
  leaderboardPreview: LeaderboardPreview | null;
  remainingStudyCount: number;
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

const CAT_ENV: Partial<EnvThresholds> = {
  CAT_HUNGRY_HOURS: 12,
  CAT_SMELLY_HOURS: 24,
  CAT_STRESS_AFTER_PLAY_MISS_HOURS: 3,
  CAT_STRESS_WARNING_LIMIT_HOURS: 12,
  CAT_SICK_AFTER_NO_PLAY_HOURS: 15,
  CAT_SICK_AFTER_SMELLY_HOURS: 72,
  CAT_DEATH_AFTER_NO_FEED_DAYS: 7,
  CAT_STRESSED_HOURS: 24,
  CAT_SICK_HOURS: 48,
  CAT_CRITICAL_HOURS: 24,
  CAT_DEAD_DAYS: 3
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
  return {
    points: rewards.ledger.totalPoints,
    streak,
    dailyGoal,
    level
  };
}

function parsePositiveInteger(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

function buildOptimisticLeaderboardPreview(
  preview: LeaderboardPreview | null,
  scoreDelta: number,
  userId: string
): LeaderboardPreview | null {
  if (!preview || scoreDelta === 0) {
    return preview;
  }

  const hasCurrentUser = preview.topEntries.some(
    (entry) => entry.userId === userId
  );
  const nextEntries = hasCurrentUser
    ? preview.topEntries.map((entry) =>
        entry.userId === userId
          ? {
              ...entry,
              score: entry.score + scoreDelta
            }
          : entry
      )
    : [
        ...preview.topEntries,
        {
          userId,
          rank: preview.myRank ?? preview.topEntries.length + 1,
          score: scoreDelta,
          isCurrentUser: true
        }
      ];

  const rankedEntries = nextEntries
    .slice()
    .sort((left, right) => {
      if (left.score === right.score) {
        return left.userId.localeCompare(right.userId);
      }

      return right.score - left.score;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  const currentUserEntry =
    rankedEntries.find((entry) => entry.userId === userId) ?? null;

  return {
    weekId: preview.weekId,
    myRank: currentUserEntry?.rank ?? preview.myRank,
    topEntries: rankedEntries.slice(0, 3)
  };
}

export default function HomeDashboard(props: HomeDashboardProps) {
  const {
    loading = false,
    locale = 'ko',
    pendingSource,
    pendingPoints,
    pendingLeaderboardScore,
    initialStats = null,
    leaderboardPreview = null
  } = props;
  const dashboard = buildDashboardState();
  const settingsHref = locale === 'en' ? '/settings?locale=en' : '/settings';
  const auth = useAppAuth();
  const { cat } = useCat();
  const [isCatGuideOpen, setIsCatGuideOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationState>({
    words: [],
    loading: false
  });
  const [syncState, setSyncState] = useState<SyncState>({
    loading: false,
    synced: false
  });
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [firebaseHomeState, setFirebaseHomeState] = useState<HomeFirebaseState>({
    loading: false,
    dashboardStats: null,
    homeSummary: null,
    leaderboardPreview: null,
    remainingStudyCount: 0
  });
  const thresholds = getCatThresholds(CAT_ENV);
  const pendingPointsValue =
    pendingSource === 'recommendation'
      ? parsePositiveInteger(pendingPoints)
      : 0;
  const pendingLeaderboardValue =
    pendingSource === 'recommendation'
      ? parsePositiveInteger(pendingLeaderboardScore)
      : 0;
  const basePoints = auth.isAuthenticated
    ? firebaseHomeState.dashboardStats?.totalPoints ?? 0
    : initialStats?.totalPoints ?? dashboard.points;
  const baseLeaderboardScore = auth.isAuthenticated
    ? firebaseHomeState.dashboardStats?.leaderboardScore ?? 0
    : initialStats?.leaderboardScore ?? 0;
  const totalPoints = basePoints + pendingPointsValue;
  const totalLeaderboardScore = baseLeaderboardScore + pendingLeaderboardValue;
  const totalLevel = calculateLevelProgress(totalPoints + 135);
  const optimisticLeaderboardPreview =
    pendingSource === 'recommendation'
      ? buildOptimisticLeaderboardPreview(
          auth.isAuthenticated
            ? firebaseHomeState.leaderboardPreview
            : leaderboardPreview,
          pendingLeaderboardValue,
          auth.userId
        )
      : auth.isAuthenticated
        ? firebaseHomeState.leaderboardPreview
        : leaderboardPreview;
  const catSnapshot = cat ? buildCatStateSnapshot(cat, Date.now(), thresholds) : null;
  const hoursSinceFeed = cat ? (Date.now() - cat.lastFedAt) / (60 * 60 * 1000) : 0;
  const hoursSinceWash = cat ? (Date.now() - cat.lastWashedAt) / (60 * 60 * 1000) : 0;
  const hoursSincePlay = cat ? (Date.now() - cat.lastPlayedAt) / (60 * 60 * 1000) : 0;

  const careSummary =
    !cat || !catSnapshot
      ? null
      : buildHomeCareSummary({
          status: catSnapshot.status,
          isStressWarning: catSnapshot.isStressWarning,
          hoursSinceFeed,
          hoursSinceWash,
          hoursSincePlay,
          thresholds
        });
  const firebaseDailyGoal = calculateDailyGoal(
    firebaseHomeState.homeSummary?.todayCompleted ?? 0,
    firebaseHomeState.homeSummary?.dailyGoalTarget ?? 10
  );

  const quickStartPanel = (
    <section
      className="home-feature-row__quick"
      style={{ ...panelStyle, display: 'grid', gap: 14, alignContent: 'start' }}
    >
      <div style={badgeStyle}>{t(locale, 'home.quick_start')}</div>
      <p style={{ margin: 0, lineHeight: 1.6 }}>
        {t(locale, 'home.quick_start.description')}
      </p>
      {careSummary ? (
        <div
          style={{
            borderRadius: 14,
            padding: '14px 16px',
            background: 'var(--bg-paper)',
            border: '1px solid var(--border-pencil)',
            display: 'grid',
            gap: 6
          }}
        >
          <strong>지금 필요한 돌봄</strong>
          <span style={{ color: 'var(--text-ink)' }}>{careSummary.title}</span>
          <span style={{ color: 'var(--text-faded)', lineHeight: 1.5 }}>
            {careSummary.description}
          </span>
        </div>
      ) : null}
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
        <Link
          href={settingsHref}
          aria-label={t(locale, 'settings.title')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-pencil)',
            padding: '8px 16px',
            borderRadius: 12,
            color: 'var(--text-ink)',
            fontWeight: 600,
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {t(locale, 'settings.title')}
        </Link>
        <button
          type="button"
          aria-label={
            auth.isAuthenticated
              ? locale === 'en'
                ? 'Sign out'
                : '로그아웃'
              : t(locale, 'settings.google_login')
          }
          onClick={() => void startGoogleLogin()}
          style={{
            background: '#fff',
            border: '1px solid var(--border-pencil)',
            padding: '8px 16px',
            borderRadius: 12,
            color: 'var(--text-ink)',
            fontWeight: 600,
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          {auth.isAuthenticated
            ? locale === 'en'
              ? 'Sign out'
              : '로그아웃'
            : t(locale, 'settings.google_login')}
        </button>
      </div>
      {authMessage ? (
        <p role="status" style={{ margin: 0, color: 'var(--text-faded)' }}>
          {authMessage}
        </p>
      ) : null}
    </section>
  );

  async function startGoogleLogin() {
    try {
      if (auth.isAuthenticated) {
        await auth.signOut();
        window.location.href = locale === 'en' ? '/?locale=en' : '/';
        return;
      }

      const result = await auth.signIn();
      const currentSettings = readStoredSettingsSnapshot();
      saveStoredSettings(
        userSettingsSchema.parse({
          ...currentSettings,
          userId: result.user.uid,
          updatedAt: new Date().toISOString()
        })
      );
      setAuthMessage(
        `${t(locale, 'settings.google_login_success')} ${result.user.displayName?.trim() || result.user.email?.trim() || result.user.uid}`
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t(locale, 'settings.google_login_error');
      setAuthMessage(`${t(locale, 'settings.google_login_error')} ${message}`);
    }
  }

  async function requestRecommendation() {
    if (!auth.isAuthenticated) {
      return;
    }

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
          userId: auth.userId,
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
    if (!auth.authReady) {
      return;
    }

    if (!auth.isAuthenticated) {
      setFirebaseHomeState({
        loading: false,
        dashboardStats: null,
        homeSummary: null,
        leaderboardPreview: null,
        remainingStudyCount: 0
      });
      setRecommendation({
        words: [],
        loading: false
      });
      return;
    }

    let cancelled = false;

    async function hydrateFirebaseHome() {
      setFirebaseHomeState((current) => ({
        ...current,
        loading: true
      }));

      const now = new Date().toISOString();
      const [
        dashboardStats,
        homeSummary,
        weeklyRecommendation,
        weeklyLeaderboardPreview
      ] = await Promise.all([
        loadFirebaseDashboardStats(auth.userId),
        loadFirebaseHomeSummary(auth.userId),
        loadFirebaseCurrentWeekRecommendation(auth.userId, now),
        loadFirebaseLeaderboardPreview(auth.userId, now)
      ]);
      const remainingStudyCount = Math.max(
        (homeSummary?.dailyGoalTarget ?? 10) - (homeSummary?.todayCompleted ?? 0),
        0
      );

      if (cancelled) {
        return;
      }

      setFirebaseHomeState({
        loading: false,
        dashboardStats,
        homeSummary,
        leaderboardPreview: weeklyLeaderboardPreview,
        remainingStudyCount
      });
      setRecommendation({
        words: weeklyRecommendation?.words ?? [],
        loading: false,
        ...(weeklyRecommendation?.requestedAt
          ? { requestedAt: weeklyRecommendation.requestedAt }
          : {}),
        ...(weeklyRecommendation?.weekId
          ? { weekId: weeklyRecommendation.weekId }
          : {})
      });
    }

    void hydrateFirebaseHome();

    return () => {
      cancelled = true;
    };
  }, [auth.authReady, auth.isAuthenticated, auth.userId]);

  useEffect(() => {
    if (
      !auth.isAuthenticated ||
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
            userId: auth.userId,
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
    auth.isAuthenticated,
    auth.userId,
    pendingLeaderboardValue,
    pendingPointsValue,
    pendingSource,
    syncState.loading,
    syncState.synced
  ]);

  return (
    <main style={surfaceStyle}>
      {auth.isAuthenticated && auth.needsTermsConsent ? (
        <TermsConsentModal locale={locale} onAccept={() => void auth.acceptTerms()} />
      ) : null}
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

        <section className="home-feature-row">
          <div className="home-feature-row__cat">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setIsCatGuideOpen(true)}
                style={{
                  borderRadius: 999,
                  border: '1px solid var(--border-pencil)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-ink)',
                  padding: '8px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                고양이 사육방법
              </button>
            </div>
            <CatCard />
          </div>
          {quickStartPanel}
        </section>

        {isCatGuideOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="고양이 사육방법"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.52)',
              display: 'grid',
              placeItems: 'center',
              padding: 20,
              zIndex: 1000
            }}
          >
            <section
              style={{
                width: 'min(560px, 100%)',
                borderRadius: 20,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-pencil)',
                boxShadow: 'var(--shadow-card)',
                padding: 24,
                display: 'grid',
                gap: 14
              }}
            >
              <h2 style={{ margin: 0, fontSize: 24 }}>고양이 사육방법</h2>
              <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-faded)' }}>
                학습으로 포인트를 모아 고양이를 돌보는 방식입니다. 처음 시작할 때 꼭 알아야 할 규칙만 정리했습니다.
              </p>
              <div style={{ display: 'grid', gap: 10, lineHeight: 1.6, color: 'var(--text-ink)' }}>
                <p style={{ margin: 0 }}>1. `밥주기`, `씻기기`, `놀아주기`는 하루에 한 번씩 해주는 것이 기본입니다.</p>
                <p style={{ margin: 0 }}>2. 학습을 하면 포인트를 얻고, 그 포인트로 고양이 돌봄 액션을 사용할 수 있습니다.</p>
                <p style={{ margin: 0 }}>3. 하루 동안 고양이를 돌보러 오지 않으면 `치료하기`가 필요합니다.</p>
                <p style={{ margin: 0 }}>4. 치료가 필요한 상태에서 3일 더 방치하면 고양이가 죽습니다.</p>
                <p style={{ margin: 0 }}>5. 고양이가 죽으면 성장 단계에 맞는 dead 이미지가 보이고, `고양이 다시 키우기`로 처음부터 다시 시작할 수 있습니다.</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCatGuideOpen(false)}
                  style={{
                    borderRadius: 12,
                    border: '1px solid var(--border-pencil)',
                    background: 'var(--accent-yellow)',
                    color: 'var(--text-ink)',
                    padding: '10px 16px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  확인
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {auth.isAuthenticated &&
        pendingSource === 'recommendation' &&
        (pendingPointsValue > 0 || pendingLeaderboardValue > 0) ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            <div style={badgeStyle}>{t(locale, 'home.sync.title')}</div>
            <p style={{ margin: 0, color: 'var(--text-ink)', lineHeight: 1.6 }}>
              {t(locale, 'home.sync.description')} +{pendingPointsValue}pt
              {pendingLeaderboardValue > 0
                ? ` · ${t(locale, 'home.sync.leaderboard')} +${pendingLeaderboardValue}`
                : ''}
              {syncState.loading
                ? ` · ${t(locale, 'home.sync.pending').toLowerCase()}...`
                : ''}
            </p>
          </section>
        ) : null}

        {auth.isAuthenticated ? (
        <section
          className="home-summary-grid"
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
              {firebaseHomeState.loading ? '...' : firebaseHomeState.remainingStudyCount}
            </h2>
            <p style={{ margin: 0 }}>{t(locale, 'home.summary.today')}</p>
          </article>

          <article style={panelStyle}>
            <div style={badgeStyle}>{t(locale, 'home.summary.streak')}</div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              {firebaseHomeState.loading
                ? '...'
                : `${firebaseHomeState.homeSummary?.currentStreak ?? 0}일`}
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

          <article
            className="home-summary-grid__wide"
            style={panelStyle}
          >
            <div style={badgeStyle}>
              {t(locale, 'home.summary.leaderboard')}
            </div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              {totalLeaderboardScore} pt
            </h2>
            <p style={{ margin: 0 }}>
              {optimisticLeaderboardPreview?.myRank
                ? `${t(locale, 'home.summary.leaderboard_rank')} #${optimisticLeaderboardPreview.myRank}`
                : t(locale, 'home.summary.leaderboard_empty')}
            </p>
            {optimisticLeaderboardPreview?.topEntries.length ? (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  marginTop: 14
                }}
              >
                <span style={{ color: 'var(--text-faded)', fontSize: 13 }}>
                  {optimisticLeaderboardPreview.weekId}
                </span>
                {optimisticLeaderboardPreview.topEntries.map((entry) => (
                  <Link
                    key={`${optimisticLeaderboardPreview.weekId}-${entry.userId}`}
                    href={`/leaderboard?userId=${encodeURIComponent(
                      entry.userId
                    )}&view=nearby`}
                    aria-label={`리더보드에서 ${entry.isCurrentUser ? '나' : entry.userId} 보기`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr auto',
                      gap: 8,
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: entry.isCurrentUser
                        ? 'var(--accent-pink)'
                        : 'var(--bg-paper)',
                      border: '1px solid var(--border-pencil)',
                      color: 'var(--text-ink)',
                      textDecoration: 'none'
                    }}
                  >
                    <strong>#{entry.rank}</strong>
                    <span>{entry.isCurrentUser ? '나' : entry.userId}</span>
                    <strong>{entry.score} pt</strong>
                  </Link>
                ))}
              </div>
            ) : null}
            <p style={{ margin: '14px 0 0' }}>
              <Link
                href="/leaderboard"
                style={{
                  color: 'var(--text-ink)',
                  textDecoration: 'underline',
                  fontWeight: 600
                }}
              >
                {t(locale, 'home.summary.leaderboard')}
              </Link>
            </p>
          </article>

          <article
            className="home-summary-grid__wide"
            style={panelStyle}
            data-testid="home-daily-goal-card"
          >
            <div style={badgeStyle}>{t(locale, 'home.goal')}</div>
            <h2 style={{ margin: '16px 0 8px', fontSize: 34 }}>
              {firebaseHomeState.loading
                ? '...'
                : `${firebaseHomeState.homeSummary?.todayCompleted ?? 0}/${firebaseHomeState.homeSummary?.dailyGoalTarget ?? 10}`}
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
                  width: `${firebaseDailyGoal.progressPercent}%`,
                  height: '100%',
                  background: 'var(--accent-green)'
                }}
              />
            </div>
            <p style={{ margin: '12px 0 0' }}>
              {firebaseDailyGoal.progressPercent}% ·{' '}
              {firebaseDailyGoal.isComplete
                ? t(locale, 'home.goal.complete')
                : t(locale, 'home.goal.in_progress')}
            </p>
          </article>
        </section>
        ) : null}

        {auth.isAuthenticated ? (
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
        ) : null}

      </div>
    </main>
  );
}

function buildHomeCareSummary(input: {
  status: string;
  isStressWarning: boolean;
  hoursSinceFeed: number;
  hoursSinceWash: number;
  hoursSincePlay: number;
  thresholds: EnvThresholds;
}) {
  const {
    status,
    isStressWarning,
    hoursSinceFeed,
    hoursSinceWash,
    hoursSincePlay,
    thresholds
  } = input;

  if (status === 'critical') {
    return {
      title: '즉시 치료가 필요해요',
      description: '위험 상태라서 바로 치료하지 않으면 더 악화될 수 있습니다.'
    };
  }

  if (status === 'sick') {
    return {
      title: '약을 먹여서 회복시켜야 해요',
      description: '질병 상태이므로 치료하기 액션을 먼저 실행하는 편이 안전합니다.'
    };
  }

  if (isStressWarning) {
    return {
      title: '15시간 전에 놀아줘야 해요',
      description: `현재 ${Math.floor(hoursSincePlay)}시간째라서 스트레스 질병 구간에 가까워지고 있습니다.`
    };
  }

  if (status === 'stressed') {
    return {
      title: '조금 놀아주면 안정돼요',
      description: `마지막으로 놀아준 지 ${Math.floor(hoursSincePlay)}시간 지났습니다.`
    };
  }

  if (status === 'smelly') {
    return {
      title: '씻기기 타이밍이에요',
      description: `냄새 상태가 시작됐고 ${Math.max(
        0,
        thresholds.CAT_SICK_AFTER_SMELLY_HOURS - Math.floor(hoursSinceWash)
      )}시간 안에 씻기면 안전합니다.`
    };
  }

  if (status === 'hungry') {
    return {
      title: '밥을 먼저 줘야 해요',
      description: `배고픔 상태이며 ${Math.max(
        0,
        thresholds.CAT_DEATH_AFTER_NO_FEED_DAYS * 24 - Math.floor(hoursSinceFeed)
      )}시간 뒤 생존 위험이 커집니다.`
    };
  }

  return {
    title: '오늘 15분 학습이면 충분해요',
    description: `다음 놀이 경고까지 ${Math.max(
      0,
      thresholds.CAT_STRESS_WARNING_LIMIT_HOURS - Math.floor(hoursSincePlay)
    )}시간 남았습니다.`
  };
}
