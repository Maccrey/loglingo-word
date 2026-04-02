// @vitest-environment jsdom

import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const observeFirebaseAuthMock = vi.fn();
const signInWithGooglePopupMock = vi.fn();
const signOutFirebaseUserMock = vi.fn();
const loadFirebaseUserProfileMock = vi.fn(async () => null);
const loadFirebaseLearningStateMock = vi.fn(async () => null);
const loadFirebaseHomeSummaryMock = vi.fn(async () => null);
const saveFirebaseUserProfileMock = vi.fn(async () => undefined);
const saveFirebaseLearningStateMock = vi.fn(async () => undefined);
const saveFirebaseHomeSummaryMock = vi.fn(async () => undefined);
const readStoredSettingsSnapshotMock = vi.fn(() => ({
  userId: 'local-user',
  learningLanguage: 'en',
  learningLevel: 'cefr_a1',
  sessionQuestionCount: 5,
  appLanguage: 'ko',
  notificationsEnabled: true,
  premiumEnabled: false,
  updatedAt: '2026-03-31T00:00:00.000Z'
}));
const saveStoredSettingsMock = vi.fn();
const readStoredLearningProgressSnapshotMock = vi.fn(() => []);
const saveStoredLearningProgressMock = vi.fn();
const upsertLearningProgressMock = vi.fn((_remote, local) => local);

vi.mock('../../apps/web/src/lib/firebase-client', () => ({
  hasFirebaseWebConfig: () => true,
  observeFirebaseAuth: (...args: unknown[]) => observeFirebaseAuthMock(...args),
  signInWithGooglePopup: (...args: unknown[]) => signInWithGooglePopupMock(...args),
  signOutFirebaseUser: (...args: unknown[]) => signOutFirebaseUserMock(...args),
  loadFirebaseUserProfile: (...args: unknown[]) => loadFirebaseUserProfileMock(...args),
  loadFirebaseLearningState: (...args: unknown[]) => loadFirebaseLearningStateMock(...args),
  loadFirebaseHomeSummary: (...args: unknown[]) => loadFirebaseHomeSummaryMock(...args),
  saveFirebaseUserProfile: (...args: unknown[]) => saveFirebaseUserProfileMock(...args),
  saveFirebaseLearningState: (...args: unknown[]) => saveFirebaseLearningStateMock(...args),
  saveFirebaseHomeSummary: (...args: unknown[]) => saveFirebaseHomeSummaryMock(...args)
}));

vi.mock('../../apps/web/src/lib/settingsStorage', () => ({
  createFallbackSettings: () => ({
    userId: 'fallback-user',
    learningLanguage: 'en',
    learningLevel: 'cefr_a1',
    sessionQuestionCount: 5,
    appLanguage: 'ko',
    notificationsEnabled: true,
    premiumEnabled: false,
    updatedAt: '2026-03-31T00:00:00.000Z'
  }),
  readStoredSettingsSnapshot: () => readStoredSettingsSnapshotMock(),
  saveStoredSettings: (...args: unknown[]) => saveStoredSettingsMock(...args)
}));

vi.mock('../../apps/web/src/lib/learningProgressStorage', () => ({
  readStoredLearningProgressSnapshot: () => readStoredLearningProgressSnapshotMock(),
  saveStoredLearningProgress: (...args: unknown[]) => saveStoredLearningProgressMock(...args),
  upsertLearningProgress: (...args: unknown[]) => upsertLearningProgressMock(...args)
}));

import { useAppAuth } from '../../apps/web/src/lib/useAppAuth';

function AuthConsumer({ name }: { name: string }) {
  const auth = useAppAuth();

  return <div>{`${name}:${auth.status}:${auth.userId}:${auth.authReady}`}</div>;
}

describe('useAppAuth', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    loadFirebaseUserProfileMock.mockImplementation(async () => null);
    loadFirebaseLearningStateMock.mockImplementation(async () => null);
    loadFirebaseHomeSummaryMock.mockImplementation(async () => null);
    saveFirebaseUserProfileMock.mockImplementation(async () => undefined);
    saveFirebaseLearningStateMock.mockImplementation(async () => undefined);
    saveFirebaseHomeSummaryMock.mockImplementation(async () => undefined);
  });

  it('hydrates Firebase auth only once across multiple hook consumers', async () => {
    let authCallback: ((user: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
    } | null) => void) | null = null;

    observeFirebaseAuthMock.mockImplementation((callback) => {
      authCallback = callback;
      return () => undefined;
    });

    render(
      <>
        <AuthConsumer name="left" />
        <AuthConsumer name="right" />
      </>
    );

    expect(observeFirebaseAuthMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      authCallback?.({
        uid: 'firebase-user',
        email: 'user@example.com',
        displayName: 'Tester',
        photoURL: null
      });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(loadFirebaseUserProfileMock).toHaveBeenCalledTimes(1);
    expect(loadFirebaseLearningStateMock).toHaveBeenCalledTimes(1);
    expect(loadFirebaseHomeSummaryMock).toHaveBeenCalledTimes(1);
    expect(saveFirebaseUserProfileMock).toHaveBeenCalledTimes(1);
    expect(saveFirebaseLearningStateMock).toHaveBeenCalledTimes(1);
    expect(saveFirebaseHomeSummaryMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('left:authenticated:firebase-user:true')).toBeTruthy();
    expect(screen.getByText('right:authenticated:firebase-user:true')).toBeTruthy();
  });
});
