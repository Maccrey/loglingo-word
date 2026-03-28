'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  doc,
  getDoc,
  getFirestore,
  setDoc
} from 'firebase/firestore';

import { userSettingsSchema, vocabProgressSchema, type UserSettings, type VocabProgress } from '@wordflow/shared/types';

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {})
  };
}

export function hasFirebaseWebConfig(): boolean {
  return getFirebaseWebConfig() !== null;
}

export function getFirebaseClientApp(): FirebaseApp {
  const existing = getApps()[0];

  if (existing) {
    return existing;
  }

  const config = getFirebaseWebConfig();

  if (!config) {
    throw new Error('Firebase web configuration is incomplete.');
  }

  return initializeApp(config);
}

export async function initializeFirebaseAnalytics() {
  if (typeof window === 'undefined') {
    return null;
  }

  const config = getFirebaseWebConfig();

  if (!config?.measurementId) {
    return null;
  }

  const supported = await isSupported().catch(() => false);

  if (!supported) {
    return null;
  }

  return getAnalytics(getFirebaseClientApp());
}

export async function signInWithGooglePopup() {
  const auth = getAuth(getFirebaseClientApp());
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  return signInWithPopup(auth, provider);
}

export function observeFirebaseAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(getAuth(getFirebaseClientApp()), callback);
}

export async function signOutFirebaseUser() {
  await signOut(getAuth(getFirebaseClientApp()));
}

type FirebaseUserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  termsAcceptedAt?: string;
};

type FirebaseLearningState = {
  userId: string;
  settings: UserSettings;
  progress: VocabProgress[];
  updatedAt: string;
};

function getFirestoreDb() {
  return getFirestore(getFirebaseClientApp());
}

export async function loadFirebaseUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  const snapshot = await getDoc(doc(getFirestoreDb(), 'user_profiles', uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as FirebaseUserProfile;
}

export async function saveFirebaseUserProfile(
  uid: string,
  profile: Partial<FirebaseUserProfile>
) {
  const existing = await loadFirebaseUserProfile(uid);
  const now = new Date().toISOString();

  await setDoc(
    doc(getFirestoreDb(), 'user_profiles', uid),
    {
      uid,
      email: profile.email ?? existing?.email ?? null,
      displayName: profile.displayName ?? existing?.displayName ?? null,
      photoURL: profile.photoURL ?? existing?.photoURL ?? null,
      createdAt: existing?.createdAt ?? now,
      lastLoginAt: profile.lastLoginAt ?? now,
      ...(profile.termsAcceptedAt || existing?.termsAcceptedAt
        ? {
            termsAcceptedAt:
              profile.termsAcceptedAt ?? existing?.termsAcceptedAt
          }
        : {})
    },
    { merge: true }
  );
}

export async function loadFirebaseLearningState(
  uid: string
): Promise<FirebaseLearningState | null> {
  const snapshot = await getDoc(doc(getFirestoreDb(), 'user_learning', uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as {
    userId: string;
    settings: unknown;
    progress: unknown[];
    updatedAt: string;
  };

  return {
    userId: data.userId,
    settings: userSettingsSchema.parse(data.settings),
    progress: Array.isArray(data.progress)
      ? data.progress
          .map((item) => vocabProgressSchema.safeParse(item))
          .flatMap((result) => (result.success ? [result.data] : []))
      : [],
    updatedAt: data.updatedAt
  };
}

export async function saveFirebaseLearningState(
  uid: string,
  input: {
    settings: UserSettings;
    progress: VocabProgress[];
  }
) {
  await setDoc(
    doc(getFirestoreDb(), 'user_learning', uid),
    {
      userId: uid,
      settings: userSettingsSchema.parse(input.settings),
      progress: input.progress.map((item) => vocabProgressSchema.parse(item)),
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}
