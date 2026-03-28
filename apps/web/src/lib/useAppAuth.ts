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

export type AppAuthStatus = 'loading' | 'guest' | 'authenticated';

type AppAuthState = {
  status: AppAuthStatus;
  userId: string;
  displayName: string | null;
  email: string | null;
  needsTermsConsent: boolean;
  authReady: boolean;
};

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

export function useAppAuth() {
  const [state, setState] = useState<AppAuthState>({
    status: 'loading',
    userId: createFallbackSettings().userId,
    displayName: null,
    email: null,
    needsTermsConsent: false,
    authReady: false
  });

  useEffect(() => {
    if (!hasFirebaseWebConfig()) {
      setState({
        status: 'guest',
        userId: createFallbackSettings().userId,
        displayName: null,
        email: null,
        needsTermsConsent: false,
        authReady: true
      });
      return;
    }

    const unsubscribe = observeFirebaseAuth(async (user) => {
      if (!user) {
        setState({
          status: 'guest',
          userId: createFallbackSettings().userId,
          displayName: null,
          email: null,
          needsTermsConsent: false,
          authReady: true
        });
        return;
      }

      const [profile, learningState] = await Promise.all([
        loadFirebaseUserProfile(user.uid),
        loadFirebaseLearningState(user.uid)
      ]);
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
      await saveFirebaseUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: new Date().toISOString()
      });
      await saveFirebaseLearningState(user.uid, {
        settings: mergedSettings,
        progress: mergedProgress
      });
      await saveFirebaseHomeSummary(
        user.uid,
        (await loadFirebaseHomeSummary(user.uid)) ?? {
          userId: user.uid,
          currentStreak: 0,
          todayCompleted: 0,
          studyMinutesToday: 0,
          dailyGoalTarget: 10,
          updatedAt: new Date().toISOString()
        }
      );

      setState({
        status: 'authenticated',
        userId: user.uid,
        displayName: user.displayName,
        email: user.email,
        needsTermsConsent: !profile?.termsAcceptedAt,
        authReady: true
      });
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    setState((current) => ({
      ...current,
      status: 'loading',
      authReady: false
    }));

    try {
      return await signInWithGooglePopup();
    } catch (error) {
      setState({
        status: 'guest',
        userId: createFallbackSettings().userId,
        displayName: null,
        email: null,
        needsTermsConsent: false,
        authReady: true
      });
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

      await saveFirebaseLearningState(state.userId, input);
      return true;
    },
    [state.status, state.userId]
  );

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
    recordLearningSession
  };
}
