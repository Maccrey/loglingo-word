'use client';

import { useCallback, useEffect, useState } from 'react';
import { type UserSettings, userSettingsSchema } from '@wordflow/shared/types';
import { type VocabProgress } from '@wordflow/shared/types';

import {
  hasFirebaseWebConfig,
  loadFirebaseLearningState,
  loadFirebaseUserProfile,
  observeFirebaseAuth,
  saveFirebaseLearningState,
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
    return signInWithGooglePopup();
  }, []);

  const acceptTerms = useCallback(async () => {
    if (state.status !== 'authenticated') {
      return;
    }

    await saveFirebaseUserProfile(state.userId, {
      termsAcceptedAt: new Date().toISOString()
    });
    setState((current) => ({
      ...current,
      needsTermsConsent: false
    }));
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

  return {
    ...state,
    isAuthenticated: state.status === 'authenticated',
    isGuest: state.status === 'guest',
    signIn,
    signOut: signOutUser,
    acceptTerms,
    saveLearningState
  };
}
