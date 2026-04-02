'use client';

import {
  FirebaseError,
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp
} from 'firebase/app';
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
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where
} from 'firebase/firestore';

import {
  feedCommentSchema,
  learningResultPostSchema,
  userDashboardStatsSchema,
  userHomeSummarySchema,
  userSettingsSchema,
  vocabProgressSchema,
  type FeedComment,
  type LearningResultPost,
  type UserDashboardStats,
  type UserHomeSummary,
  type UserSettings,
  type VocabProgress
} from '@wordflow/shared/types';
import type { Cat, PointLedger } from '@wordflow/shared/cat';
import { updateLearningStreak } from '@wordflow/core/gamification';
import { canRequestWeeklyRecommendation } from '@wordflow/ai/recommendation';

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

type FirebaseCatState = {
  userId: string;
  cat: Cat;
  syncedAt: string;
};

type FirebasePointLedgerState = {
  userId: string;
  ledgers: PointLedger[];
  syncedAt: string;
};

type FirebaseLeaderboardPreview = {
  weekId: string;
  myRank: number | null;
  topEntries: Array<{
    userId: string;
    rank: number;
    score: number;
    isCurrentUser: boolean;
  }>;
};

type FirebaseFeedCommentRecord = FeedComment;

function getFirestoreDb() {
  return getFirestore(getFirebaseClientApp());
}

function isRecoverableFirestoreReadError(error: unknown): boolean {
  if (!(error instanceof FirebaseError)) {
    return false;
  }

  const normalizedCode = error.code.includes('/')
    ? error.code.split('/')[1] ?? error.code
    : error.code;

  return [
    'unavailable',
    'failed-precondition',
    'offline',
    'deadline-exceeded',
    'resource-exhausted'
  ].includes(normalizedCode);
}

function isResourceExhausted(error: unknown): boolean {
  if (!(error instanceof FirebaseError)) {
    return false;
  }

  const normalizedCode = error.code.includes('/')
    ? error.code.split('/')[1] ?? error.code
    : error.code;

  return normalizedCode === 'resource-exhausted';
}

async function safeFirestoreWrite(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch (error) {
    if (isResourceExhausted(error)) {
      console.warn('[firebase-client] Firestore write skipped because quota was exhausted.');
      return;
    }

    throw error;
  }
}

export async function loadFirebaseUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  try {
    const snapshot = await getDoc(doc(getFirestoreDb(), 'user_profiles', uid));

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as FirebaseUserProfile;
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
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
  try {
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
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
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

export async function loadFirebaseDashboardStats(
  uid: string
): Promise<UserDashboardStats | null> {
  try {
    const snapshot = await getDoc(doc(getFirestoreDb(), 'dashboard_stats', uid));

    if (!snapshot.exists()) {
      return null;
    }

    return userDashboardStatsSchema.parse(snapshot.data());
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveFirebaseDashboardStats(
  uid: string,
  stats: UserDashboardStats
) {
  await setDoc(
    doc(getFirestoreDb(), 'dashboard_stats', uid),
    userDashboardStatsSchema.parse(stats),
    { merge: true }
  );
}

export async function loadFirebaseHomeSummary(
  uid: string
): Promise<UserHomeSummary | null> {
  try {
    const snapshot = await getDoc(doc(getFirestoreDb(), 'home_summaries', uid));

    if (!snapshot.exists()) {
      return null;
    }

    return userHomeSummarySchema.parse(snapshot.data());
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveFirebaseHomeSummary(
  uid: string,
  summary: UserHomeSummary
) {
  await setDoc(
    doc(getFirestoreDb(), 'home_summaries', uid),
    userHomeSummarySchema.parse(summary),
    { merge: true }
  );
}

export async function recordFirebaseLearningActivity(
  uid: string,
  input: {
    learnedAt: string;
    completedCount: number;
    studyDurationMinutes?: number;
    dailyGoalTarget?: number;
  }
) {
  const existing = await loadFirebaseHomeSummary(uid);
  const learnedDay = input.learnedAt.slice(0, 10);
  const previousDay = existing?.updatedAt?.slice(0, 10);
  const isSameDay = previousDay === learnedDay;
  const streak = updateLearningStreak(
    {
      currentStreak: existing?.currentStreak ?? 0,
      ...(existing?.lastLearnedOn
        ? { lastLearnedOn: existing.lastLearnedOn }
        : {})
    },
    input.learnedAt
  );

  const nextSummary = userHomeSummarySchema.parse({
    userId: uid,
    currentStreak: streak.currentStreak,
    ...(streak.lastLearnedOn ? { lastLearnedOn: streak.lastLearnedOn } : {}),
    todayCompleted:
      (isSameDay ? existing?.todayCompleted ?? 0 : 0) +
      Math.max(0, Math.floor(input.completedCount)),
    studyMinutesToday:
      (isSameDay ? existing?.studyMinutesToday ?? 0 : 0) +
      Math.max(0, Math.floor(input.studyDurationMinutes ?? 0)),
    dailyGoalTarget: input.dailyGoalTarget ?? existing?.dailyGoalTarget ?? 10,
    updatedAt: input.learnedAt
  });

  await saveFirebaseHomeSummary(uid, nextSummary);
  return {
    previousSummary: existing,
    summary: nextSummary
  };
}

export async function loadFirebaseCatState(
  uid: string
): Promise<FirebaseCatState | null> {
  try {
    const snapshot = await getDoc(doc(getFirestoreDb(), 'cats', uid));

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as FirebaseCatState;
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
}

export async function loadFirebasePointLedgerState(
  uid: string
): Promise<FirebasePointLedgerState | null> {
  try {
    const snapshot = await getDoc(doc(getFirestoreDb(), 'point_ledgers', uid));

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as FirebasePointLedgerState;
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
}

export async function loadFirebaseCurrentWeekRecommendation(
  uid: string,
  now = new Date().toISOString()
) {
  const weekId = canRequestWeeklyRecommendation(now).currentWeekId;
  try {
    const snapshot = await getDoc(
      doc(getFirestoreDb(), 'ai_recommendations', `${uid}:${weekId}`)
    );

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as {
      userId: string;
      weekId: string;
      words: string[];
      requestedAt: string;
    };
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return null;
    }

    throw error;
  }
}

export async function loadFirebaseLeaderboardPreview(
  uid: string,
  now = new Date().toISOString()
): Promise<FirebaseLeaderboardPreview | null> {
  const weekId = canRequestWeeklyRecommendation(now).currentWeekId;
  try {
    const snapshot = await getDocs(
      query(collection(getFirestoreDb(), 'leaderboards'), where('weekId', '==', weekId))
    );
    const entries = snapshot.docs
      .map((item) => item.data() as { userId: string; score: number; rank: number })
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

    const myEntry = entries.find((entry) => entry.userId === uid) ?? null;

    return {
      weekId,
      myRank: myEntry?.rank ?? null,
      topEntries: entries.slice(0, 3).map((entry) => ({
        userId: entry.userId,
        rank: entry.rank,
        score: entry.score,
        isCurrentUser: entry.userId === uid
      }))
    };
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return {
        weekId,
        myRank: null,
        topEntries: []
      };
    }

    throw error;
  }
}

export async function loadFirebaseFeedPosts(): Promise<LearningResultPost[]> {
  try {
    const snapshot = await getDocs(collection(getFirestoreDb(), 'feed_posts'));

    return snapshot.docs
      .map((item) => learningResultPostSchema.parse(item.data()))
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveFirebaseFeedPost(post: LearningResultPost) {
  await safeFirestoreWrite(() =>
    setDoc(
      doc(getFirestoreDb(), 'feed_posts', post.id),
      learningResultPostSchema.parse(post),
      { merge: true }
    )
  );
}

export async function loadFirebaseFeedComments(
  postId: string
): Promise<FeedComment[]> {
  try {
    const snapshot = await getDocs(
      query(collection(getFirestoreDb(), 'feed_comments'), where('postId', '==', postId))
    );

    return snapshot.docs
      .map((item) => feedCommentSchema.parse(item.data() as FirebaseFeedCommentRecord))
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      );
  } catch (error) {
    if (isRecoverableFirestoreReadError(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveFirebaseFeedComment(comment: FeedComment) {
  await safeFirestoreWrite(() =>
    setDoc(
      doc(getFirestoreDb(), 'feed_comments', comment.id),
      feedCommentSchema.parse(comment),
      { merge: true }
    )
  );
}
