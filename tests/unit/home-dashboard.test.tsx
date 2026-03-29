// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomeDashboard from '../../apps/web/src/app/HomeDashboard';

vi.mock('../../apps/web/src/lib/useCat', () => ({
  useCat: vi.fn()
}));

const signInWithGooglePopupMock = vi.fn();
const signOutMock = vi.fn(async () => undefined);
const hasFirebaseWebConfigMock = vi.fn(() => true);
const loadFirebaseDashboardStatsMock = vi.fn(async () => null);
const loadFirebaseHomeSummaryMock = vi.fn(async () => null);
const loadFirebaseLearningStateMock = vi.fn(async () => null);
const loadFirebaseCurrentWeekRecommendationMock = vi.fn(async () => null);
const loadFirebaseLeaderboardPreviewMock = vi.fn(async () => ({
  weekId: '2026-W13',
  myRank: null,
  topEntries: []
}));

vi.mock('../../apps/web/src/lib/firebase-client', () => ({
  hasFirebaseWebConfig: () => hasFirebaseWebConfigMock(),
  signInWithGooglePopup: () => signInWithGooglePopupMock(),
  loadFirebaseDashboardStats: () => loadFirebaseDashboardStatsMock(),
  loadFirebaseHomeSummary: () => loadFirebaseHomeSummaryMock(),
  loadFirebaseLearningState: () => loadFirebaseLearningStateMock(),
  loadFirebaseCurrentWeekRecommendation: () =>
    loadFirebaseCurrentWeekRecommendationMock(),
  loadFirebaseLeaderboardPreview: () => loadFirebaseLeaderboardPreviewMock()
}));
const useAppAuthMock = vi.fn(() => ({
  status: 'guest',
  userId: 'demo-user',
  displayName: null,
  email: null,
  needsTermsConsent: false,
  authReady: true,
  isAuthenticated: false,
  isGuest: true,
  signIn: signInWithGooglePopupMock,
  signOut: signOutMock,
  acceptTerms: vi.fn(),
  saveLearningState: vi.fn(async () => false),
  recordLearningSession: vi.fn(async () => null)
}));

vi.mock('../../apps/web/src/lib/useAppAuth', () => ({
  useAppAuth: () => useAppAuthMock()
}));

const { useCat } = await import('../../apps/web/src/lib/useCat');

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

beforeEach(() => {
  vi.restoreAllMocks();
  signInWithGooglePopupMock.mockReset();
  signOutMock.mockReset();
  hasFirebaseWebConfigMock.mockReset();
  hasFirebaseWebConfigMock.mockReturnValue(true);
  loadFirebaseDashboardStatsMock.mockReset();
  loadFirebaseDashboardStatsMock.mockResolvedValue(null);
  loadFirebaseHomeSummaryMock.mockReset();
  loadFirebaseHomeSummaryMock.mockResolvedValue(null);
  loadFirebaseLearningStateMock.mockReset();
  loadFirebaseLearningStateMock.mockResolvedValue(null);
  loadFirebaseCurrentWeekRecommendationMock.mockReset();
  loadFirebaseCurrentWeekRecommendationMock.mockResolvedValue(null);
  loadFirebaseLeaderboardPreviewMock.mockReset();
  loadFirebaseLeaderboardPreviewMock.mockResolvedValue({
    weekId: '2026-W13',
    myRank: null,
    topEntries: []
  });
  useAppAuthMock.mockReset();
  useAppAuthMock.mockReturnValue({
    status: 'guest',
    userId: 'demo-user',
    displayName: null,
    email: null,
    needsTermsConsent: false,
    authReady: true,
    isAuthenticated: false,
    isGuest: true,
    signIn: signInWithGooglePopupMock,
    signOut: signOutMock,
    acceptTerms: vi.fn(),
    saveLearningState: vi.fn(async () => false),
    recordLearningSession: vi.fn(async () => null)
  });
  vi.mocked(useCat).mockReturnValue({
    cat: {
      id: 'cat-1',
      userId: 'demo-user',
      name: '로그링고',
      stage: 'kitten',
      status: 'healthy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastFedAt: Date.now(),
      lastWashedAt: Date.now(),
      lastPlayedAt: Date.now(),
      activeDays: 1
    },
    points: 5000,
    currentStatus: 'healthy',
    handleFeed: vi.fn(() => true),
    handleWash: vi.fn(() => true),
    handlePlay: vi.fn(() => true),
    handleHeal: vi.fn(() => true),
    resetCat: vi.fn()
  });
});

describe('home dashboard', () => {
  it('hides summary cards for guests', () => {
    render(<HomeDashboard />);

    expect(screen.queryByText('연속 학습 streak')).toBeNull();
    expect(screen.queryByText('주간 AI 추천')).toBeNull();
    expect(screen.queryByTestId('home-summary-grid')).toBeNull();
  });

  it('renders the main summary cards for authenticated users', async () => {
    useAppAuthMock.mockReturnValue({
      status: 'authenticated',
      userId: 'firebase-user-1',
      displayName: '사용자',
      email: 'user@example.com',
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: true,
      isGuest: false,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => true),
      recordLearningSession: vi.fn(async () => null)
    });
    loadFirebaseDashboardStatsMock.mockResolvedValue({
      userId: 'firebase-user-1',
      totalPoints: 120,
      leaderboardScore: 4,
      updatedAt: '2026-03-26T00:00:00.000Z'
    });
    loadFirebaseHomeSummaryMock.mockResolvedValue({
      userId: 'firebase-user-1',
      currentStreak: 5,
      lastLearnedOn: '2026-03-26',
      todayCompleted: 7,
      studyMinutesToday: 20,
      dailyGoalTarget: 10,
      updatedAt: '2026-03-26T00:00:00.000Z'
    });
    loadFirebaseLearningStateMock.mockResolvedValue({
      userId: 'firebase-user-1',
      settings: {
        userId: 'firebase-user-1',
        appLanguage: 'ko',
        learningLanguage: 'en',
        learningLevel: 'cefr_a1',
        sessionQuestionCount: 10,
        notificationsEnabled: true,
        premiumEnabled: false,
        updatedAt: '2026-03-26T00:00:00.000Z'
      },
      progress: [
        {
          wordId: 'passport',
          correctStreak: 1,
          storageStrength: 0.5,
          retrievalStrength: 0.4,
          nextReviewAt: '2026-03-24T00:00:00.000Z'
        }
      ],
      updatedAt: '2026-03-26T00:00:00.000Z'
    });
    loadFirebaseLeaderboardPreviewMock.mockResolvedValue({
      weekId: '2026-W13',
      myRank: 2,
      topEntries: [
        {
          userId: 'user-2',
          rank: 1,
          score: 8,
          isCurrentUser: false
        },
        {
          userId: 'firebase-user-1',
          rank: 2,
          score: 4,
          isCurrentUser: true
        }
      ]
    });

    const { container } = render(
      <HomeDashboard />
    );

    await waitFor(() => {
      expect(screen.getByText('120 pt')).toBeTruthy();
    });
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getAllByText('오늘 할 학습').length).toBeGreaterThan(0);
    expect(screen.getAllByText('연속 학습 streak').length).toBeGreaterThan(0);
    expect(screen.getAllByText('누적 포인트').length).toBeGreaterThan(0);
    expect(screen.getAllByText('주간 리더보드 점수').length).toBeGreaterThan(0);
    expect(screen.getByText('이번 주 순위 #2')).toBeTruthy();
    expect(screen.getByText('2026-W13')).toBeTruthy();
    const summaryGrid = container.querySelector('[data-testid="home-summary-grid"]');
    const dailyGoalCard = container.querySelector('[data-testid="home-daily-goal-card"]');
    const wideCards = container.querySelectorAll('.home-summary-grid__wide');
    expect(summaryGrid).toBeTruthy();
    expect(dailyGoalCard).toBeTruthy();
    expect(summaryGrid?.contains(dailyGoalCard ?? null)).toBe(true);
    expect(wideCards.length).toBe(2);
    expect(
      screen
        .getByRole('link', { name: '리더보드에서 user-2 보기' })
        .getAttribute('href')
    ).toBe('/leaderboard?userId=user-2&view=nearby');
  });

  it('renders a quick start link to the study flow', () => {
    render(<HomeDashboard />);

    const quickStart = screen.getByRole('link', { name: '단어 연습' });
    expect(quickStart.getAttribute('href')).toBe('/learn');
    expect(screen.getByRole('link', { name: '설정' }).getAttribute('href')).toBe(
      '/settings'
    );
    expect(screen.getByText('지금 필요한 돌봄')).toBeTruthy();
    expect(screen.getByText('오늘 15분 학습이면 충분해요')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Google로 로그인' })).toBeTruthy();
  });

  it('supports google sign-in from the home dashboard', async () => {
    const user = userEvent.setup();
    useAppAuthMock.mockReturnValue({
      status: 'guest',
      userId: 'demo-user',
      displayName: null,
      email: null,
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: false,
      isGuest: true,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => false),
      recordLearningSession: vi.fn(async () => null)
    });
    signInWithGooglePopupMock.mockResolvedValue({
      user: {
        uid: 'firebase-home-user',
        displayName: '홈 사용자',
        email: 'home@example.com'
      }
    });

    render(<HomeDashboard />);

    await user.click(screen.getByRole('button', { name: 'Google로 로그인' }));

    expect(screen.getByRole('status').textContent).toContain(
      '구글 로그인 완료: 홈 사용자'
    );
  });

  it('shows a sign-out button for authenticated users and signs out on click', async () => {
    const user = userEvent.setup();
    useAppAuthMock.mockReturnValue({
      status: 'authenticated',
      userId: 'firebase-home-user',
      displayName: '홈 사용자',
      email: 'home@example.com',
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: true,
      isGuest: false,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => true),
      recordLearningSession: vi.fn(async () => null)
    });

    render(<HomeDashboard />);

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('renders the cat card and quick start panel in the same feature row', () => {
    const { container } = render(<HomeDashboard />);

    const featureRow = container.querySelector('.home-feature-row');
    const catArea = container.querySelector('.home-feature-row__cat');
    const quickArea = container.querySelector('.home-feature-row__quick');

    expect(featureRow).toBeTruthy();
    expect(catArea).toBeTruthy();
    expect(quickArea).toBeTruthy();
    expect(featureRow?.contains(catArea ?? null)).toBe(true);
    expect(featureRow?.contains(quickArea ?? null)).toBe(true);
  });

  it('shows the loading state when dashboard data is pending', () => {
    render(<HomeDashboard loading />);

    expect(screen.getByText('대시보드 데이터를 불러오는 중...')).toBeTruthy();
  });

  it('switches text when the locale changes', () => {
    render(<HomeDashboard locale="en" />);

    expect(screen.getAllByText("Today's Learning Flow").length).toBeGreaterThan(
      0
    );
    expect(screen.getByRole('link', { name: 'Word Practice' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('href')).toBe(
      '/settings?locale=en'
    );
  });

  it('requests and renders weekly recommendations', async () => {
    const user = userEvent.setup();
    useAppAuthMock.mockReturnValue({
      status: 'authenticated',
      userId: 'firebase-user-1',
      displayName: '사용자',
      email: 'user@example.com',
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: true,
      isGuest: false,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => true),
      recordLearningSession: vi.fn(async () => null)
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          recommendation: {
            words: ['passport', 'subway', 'reservation'],
            requestedAt: '2026-03-26T00:00:00.000Z',
            weekId: '2026-W13'
          }
        })
      }))
    );

    render(<HomeDashboard />);

    await user.click(screen.getByRole('button', { name: '추천 받기' }));

    await waitFor(() => {
      expect(screen.getByText('passport')).toBeTruthy();
    });
    expect(screen.getByText('subway')).toBeTruthy();
    expect(screen.getByText('reservation')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '추천 학습 시작' }).getAttribute('href')
    ).toBe('/learn?focus=passport%2Csubway%2Creservation');
  });

  it('applies pending recommendation totals to the home summary', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({})
    }));
    vi.stubGlobal('fetch', fetchMock);
    useAppAuthMock.mockReturnValue({
      status: 'authenticated',
      userId: 'firebase-user-1',
      displayName: '사용자',
      email: 'user@example.com',
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: true,
      isGuest: false,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => true),
      recordLearningSession: vi.fn(async () => null)
    });
    loadFirebaseDashboardStatsMock.mockResolvedValue({
      userId: 'firebase-user-1',
      totalPoints: 45,
      leaderboardScore: 0,
      updatedAt: '2026-03-26T00:00:00.000Z'
    });
    loadFirebaseHomeSummaryMock.mockResolvedValue({
      userId: 'firebase-user-1',
      currentStreak: 2,
      lastLearnedOn: '2026-03-26',
      todayCompleted: 3,
      studyMinutesToday: 15,
      dailyGoalTarget: 10,
      updatedAt: '2026-03-26T00:00:00.000Z'
    });
    loadFirebaseLeaderboardPreviewMock.mockResolvedValue({
      weekId: '2026-W13',
      myRank: 2,
      topEntries: [
        {
          userId: 'user-2',
          rank: 1,
          score: 3,
          isCurrentUser: false
        },
        {
          userId: 'firebase-user-1',
          rank: 2,
          score: 1,
          isCurrentUser: true
        }
      ]
    });

    render(
      <HomeDashboard
        pendingSource="recommendation"
        pendingPoints="10"
        pendingLeaderboardScore="2"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('학습 반영 완료')).toBeTruthy();
      expect(
        screen.getByText(/추천 학습 결과가 홈 요약에 반영됐습니다\./)
      ).toBeTruthy();
      expect(screen.getByText('55 pt')).toBeTruthy();
      expect(screen.getByText('2 pt')).toBeTruthy();
      expect(screen.getByText('이번 주 순위 #1')).toBeTruthy();
    });
    expect(screen.getAllByText('3 pt').length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/dashboard/sync',
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  it('shows an empty leaderboard preview message for authenticated users with no weekly entry', async () => {
    useAppAuthMock.mockReturnValue({
      status: 'authenticated',
      userId: 'firebase-user-1',
      displayName: '사용자',
      email: 'user@example.com',
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: true,
      isGuest: false,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => true),
      recordLearningSession: vi.fn(async () => null)
    });

    render(<HomeDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('이번 주 리더보드 기록이 아직 없습니다.')
      ).toBeTruthy();
    });
  });

  it('shows a cat care warning summary in the quick start panel', () => {
    vi.mocked(useCat).mockReturnValue({
      cat: {
        id: 'cat-1',
        userId: 'demo-user',
        name: '로그링고',
        stage: 'kitten',
        status: 'stressed',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastFedAt: Date.now(),
        lastWashedAt: Date.now(),
        lastPlayedAt: Date.now() - 13 * 60 * 60 * 1000,
        activeDays: 1
      },
      points: 5000,
      currentStatus: 'stressed',
      handleFeed: vi.fn(() => true),
      handleWash: vi.fn(() => true),
      handlePlay: vi.fn(() => true),
      handleHeal: vi.fn(() => true),
      resetCat: vi.fn()
    });

    render(<HomeDashboard />);

    expect(screen.getByText('15시간 전에 놀아줘야 해요')).toBeTruthy();
    expect(
      screen.getByText(/스트레스 질병 구간에 가까워지고 있습니다\./)
    ).toBeTruthy();
  });

  it('opens and closes the cat guide modal from the home cat container', async () => {
    const user = userEvent.setup();

    const { container } = render(<HomeDashboard />);

    await user.click(screen.getByRole('button', { name: '고양이 사육방법' }));

    const catCard = container.querySelector('.cat-card');
    const guideButton = screen.getByRole('button', { name: '고양이 사육방법' });

    expect(catCard?.contains(guideButton)).toBe(true);
    expect(screen.getByRole('dialog', { name: '고양이 사육방법' })).toBeTruthy();
    expect(screen.getByText(/하루 동안 고양이를 돌보러 오지 않으면/)).toBeTruthy();
    expect(screen.getByText(/현재 진행도를 계산해서 알맞은 단계로 맞춰집니다\./)).toBeTruthy();
    expect(screen.queryByText(/dead 이미지가 보이고/)).toBeNull();

    await user.click(screen.getByRole('button', { name: '확인' }));

    expect(screen.queryByRole('dialog', { name: '고양이 사육방법' })).toBeNull();
  });
});
