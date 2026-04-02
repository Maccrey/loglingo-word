'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type UserHomeSummary,
  type UserSettings,
  userSettingsSchema,
  type VocabProgress
} from '@wordflow/shared/types';

import {
  hasFirebaseWebConfig,
  loadFirebaseHomeSummary,
  loadFirebaseLearningState,
  loadFirebaseUserProfile,
  observeFirebaseAuth,
  recordFirebaseLearningActivity,
  saveFirebaseLearningState,
  saveFirebaseHomeSummary,
  saveFirebaseUserProfile,
  signInWithGooglePopup,
  signOutFirebaseUser
} from './firebase-client';
import {
  createFallbackSettings,
  readStoredSettingsSnapshot,
  saveStoredSettings
} from './settingsStorage';
import {
  readStoredLearningProgressSnapshot,
  saveStoredLearningProgress,
  upsertLearningProgress
} from './learningProgressStorage';

/**
 * ── Firestore 쓰기 최적화 (Debouncing) ──
 * 학습 진척도(progress)와 설정(settings)은 빈번하게 변경되므로
 * 이들을 모아 30초마다 한 번씩 Firestore에 동기화합니다.
 */
let pendingLearningState: {
  userId: string;
  input: { settings: UserSettings; progress: VocabProgress[] };
} | null = null;

let learningSyncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 30000;

async function performLearningSync() {
  if (!pendingLearningState) return;

  const { userId, input } = pendingLearningState;
  pendingLearningState = null;

  if (learningSyncTimer) {
    clearTimeout(learningSyncTimer);
    learningSyncTimer = null;
  }

  try {
    await saveFirebaseLearningState(userId, input);
  } catch (error) {
    console.error('[useAppAuth] Failed to sync learning state to Firestore:', error);
  }
}

export type AppAuthStatus = 'loading' | 'guest' | 'authenticated';

type AppAuthState = {
  status: AppAuthStatus;
  userId: string;
  displayName: string | null;
  email: string | null;
  needsTermsConsent: boolean;
  authReady: boolean;
};

const guestState = (): AppAuthState => ({
  status: 'guest',
  userId: createFallbackSettings().userId,
  displayName: null,
  email: null,
  needsTermsConsent: false,
  authReady: true
});

const loadingState = (): AppAuthState => ({
  status: 'loading',
  userId: createFallbackSettings().userId,
  displayName: null,
  email: null,
  needsTermsConsent: false,
  authReady: false
});

let appAuthState: AppAuthState = loadingState();
const appAuthListeners = new Set<(state: AppAuthState) => void>();
let authObserverInitialized = false;

function setAppAuthState(nextState: AppAuthState) {
  appAuthState = nextState;

  appAuthListeners.forEach((listener) => {
    listener(appAuthState);
  });
}

function subscribeToAppAuth(listener: (state: AppAuthState) => void) {
  appAuthListeners.add(listener);
  listener(appAuthState);

  return () => {
    appAuthListeners.delete(listener);
  };
}

function isMoreRecent(left?: string, right?: string): boolean {
  if (!left) {
    return false;
  }

  if (!right) {
    return true;
  }

  return new Date(left).getTime() >= new Date(right).getTime();
}

function mergeSettings(
  localSettings: UserSettings,
  remoteSettings: UserSettings | null,
  userId: string
): UserSettings {
  const source =
    remoteSettings && isMoreRecent(remoteSettings.updatedAt, localSettings.updatedAt)
      ? remoteSettings
      : localSettings;

  return userSettingsSchema.parse({
    ...source,
    userId
  });
}

function shouldSyncAuthProfile(
  profile: Awaited<ReturnType<typeof loadFirebaseUserProfile>>,
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
): boolean {
  if (!profile) {
    return true;
  }

  return (
    profile.email !== user.email ||
    profile.displayName !== user.displayName ||
    profile.photoURL !== user.photoURL
  );
}

async function hydrateAuthenticatedUser(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}) {
  let profile: Awaited<ReturnType<typeof loadFirebaseUserProfile>> = null;

  try {
    const [loadedProfile, learningState, homeSummary] = await Promise.all([
      loadFirebaseUserProfile(user.uid),
      loadFirebaseLearningState(user.uid),
      loadFirebaseHomeSummary(user.uid)
    ]);
    profile = loadedProfile;

    const localSettings = readStoredSettingsSnapshot();
    const localProgress = readStoredLearningProgressSnapshot();
    const mergedSettings = mergeSettings(
      userSettingsSchema.parse({
        ...localSettings,
        userId: user.uid
      }),
      learningState?.settings ?? null,
      user.uid
    );
    const mergedProgress = upsertLearningProgress(
      learningState?.progress ?? [],
      localProgress
    );

    saveStoredSettings(mergedSettings);
    saveStoredLearningProgress(mergedProgress);
    if (shouldSyncAuthProfile(profile, user)) {
      await saveFirebaseUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: new Date().toISOString()
      });
    }
    await saveFirebaseLearningState(user.uid, {
      settings: mergedSettings,
      progress: mergedProgress
    });

    if (!homeSummary) {
      await saveFirebaseHomeSummary(user.uid, {
        userId: user.uid,
        currentStreak: 0,
        todayCompleted: 0,
        studyMinutesToday: 0,
        dailyGoalTarget: 10,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[useAppAuth] Failed to hydrate Firebase auth state:', error);
  }

  setAppAuthState({
    status: 'authenticated',
    userId: user.uid,
    displayName: user.displayName,
    email: user.email,
    needsTermsConsent: !profile?.termsAcceptedAt,
    authReady: true
  });
}

function ensureAppAuthInitialized() {
  if (authObserverInitialized) {
    return;
  }

  authObserverInitialized = true;

  if (!hasFirebaseWebConfig()) {
    setAppAuthState(guestState());
    return;
  }

  observeFirebaseAuth((user) => {
    if (!user) {
      setAppAuthState(guestState());
      return;
    }

    void hydrateAuthenticatedUser(user);
  });
}

export function useAppAuth() {
  const [state, setState] = useState<AppAuthState>(appAuthState);

  useEffect(() => {
    const unsubscribe = subscribeToAppAuth(setState);
    ensureAppAuthInitialized();

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    setAppAuthState({
      ...appAuthState,
      status: 'loading',
      authReady: false
    });

    try {
      return await signInWithGooglePopup();
    } catch (error) {
      setAppAuthState(guestState());
      throw error;
    }
  }, []);

  const acceptTerms = useCallback(async () => {
    if (state.status !== 'authenticated') {
      return;
    }

    const acceptedAt = new Date().toISOString();

    setState((current) => ({
      ...current,
      needsTermsConsent: false
    }));

    try {
      await saveFirebaseUserProfile(state.userId, {
        termsAcceptedAt: acceptedAt
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        needsTermsConsent: true
      }));
      throw error;
    }
  }, [state.status, state.userId]);

  const saveLearningState = useCallback(
    async (input: { settings: UserSettings; progress: VocabProgress[] }) => {
      if (state.status !== 'authenticated') {
        return false;
      }

      // 로컬 대기열에 저장
      pendingLearningState = {
        userId: state.userId,
        input
      };

      // 타이머가 없으면 새로 설정
      if (!learningSyncTimer) {
        learningSyncTimer = setTimeout(() => {
          void performLearningSync();
        }, SYNC_DEBOUNCE_MS);
      }

      return true;
    },
    [state.status, state.userId]
  );

  /**
   * 대기 중인 모든 학습 상태를 Firestore에 즉시 반영합니다.
   * 세션 종료나 앱 언마운트 시 호출하여 데이터 누락을 방지합니다.
   */
  const flushSaveLearningState = useCallback(async () => {
    if (!pendingLearningState) return;
    await performLearningSync();
  }, []);

  const signOutUser = useCallback(async () => {
    await signOutFirebaseUser();
  }, []);

  const recordLearningSession = useCallback(
    async (input: {
      completedCount: number;
      learnedAt?: string;
      studyDurationMinutes?: number;
      dailyGoalTarget?: number;
    }): Promise<
      | {
          previousSummary: UserHomeSummary | null;
          summary: UserHomeSummary;
        }
      | null
    > => {
      if (state.status !== 'authenticated') {
        return null;
      }

      return recordFirebaseLearningActivity(state.userId, {
        completedCount: input.completedCount,
        learnedAt: input.learnedAt ?? new Date().toISOString(),
        ...(typeof input.studyDurationMinutes === 'number'
          ? { studyDurationMinutes: input.studyDurationMinutes }
          : {}),
        ...(typeof input.dailyGoalTarget === 'number'
          ? { dailyGoalTarget: input.dailyGoalTarget }
          : {})
      });
    },
    [state.status, state.userId]
  );

  return {
    ...state,
    isAuthenticated: state.status === 'authenticated',
    isGuest: state.status === 'guest',
    signIn,
    signOut: signOutUser,
    acceptTerms,
    saveLearningState,
    flushSaveLearningState,
    recordLearningSession
  };
}
