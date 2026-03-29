import { useState, useEffect, useCallback } from 'react';
import { 
  type Cat, 
  type PointLedger, 
  type EnvThresholds,
  type ActionResult,
  calculateCatStatus,
  calculateCatStage,
  feedCat,
  batheCat,
  playWithCat,
  giveMedicine,
  giveInjection,
  calculateGrowthDays
} from '../../../../packages/shared/src/cat';
import { type LearningActivity } from '../../../../packages/shared/src/point';
import type { AppEnv } from '../../../../packages/shared/src/env';
import { createPointLedgerEntry, getPointBalance } from '../../../../services/core/src/point';
import { processLearningEventToCatPoints } from '../../../../services/core/src/point-integration';
import {
  CAT_STORAGE_UPDATED_EVENT,
  loadStoredCat,
  loadStoredCatLedgers,
  saveStoredCat,
  saveStoredCatLedgers
} from './catStorage';
import { publishFeedPost } from './feedPublishing';
import { buildPointEarnedToast, notifyAppToast } from './toast';
import { useCatSync } from './useCatSync';
import { usePointSync } from './usePointSync';
import { useAppAuth } from './useAppAuth';
import {
  hasFirebaseWebConfig,
  loadFirebaseCatState,
  loadFirebasePointLedgerState
} from './firebase-client';
import { createCatGrowthPost } from '../../../../services/core/src/social';
import { CAT_STAGES } from '../../../../packages/shared/src/cat/constants';

// Provide some default dummy env if we don't have access to the actual env
const LOCAL_APP_ENV: AppEnv = {
  NODE_ENV: 'development',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'local',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'local',
  FIREBASE_CLIENT_EMAIL: 'local@example.com',
  FIREBASE_PRIVATE_KEY: 'local',
  OPENAI_API_KEY: 'local',
  POLAR_ACCESS_TOKEN: 'local',
  POLAR_WEBHOOK_SECRET: 'local',
  POINTS_LEARNING_BASE: 500,
  POINTS_WORDS: 10,
  POINTS_REVIEW: 200,
  POINTS_SENTENCES: 50,
  POINTS_GPT_CONVERSATION: 300,
  CAT_COST_FEED: 100,
  CAT_COST_PLAY: 200,
  CAT_COST_WASH: 150,
  CAT_COST_HEAL: 1000,
  CAT_HUNGRY_HOURS: 12,
  CAT_SMELLY_HOURS: 24,
  CAT_STRESSED_HOURS: 24,
  CAT_STRESS_AFTER_PLAY_MISS_HOURS: 3,
  CAT_STRESS_WARNING_LIMIT_HOURS: 12,
  CAT_SICK_AFTER_NO_PLAY_HOURS: 15,
  CAT_SICK_AFTER_SMELLY_HOURS: 72,
  CAT_DEATH_AFTER_NO_FEED_DAYS: 7,
  CAT_SICK_HOURS: 48,
  CAT_CRITICAL_HOURS: 24,
  CAT_DEAD_DAYS: 3,
  CAT_STAGE_JUNIOR_DAYS: 30,
  CAT_STAGE_ADULT_DAYS: 90,
  CAT_STAGE_MIDDLE_AGE_DAYS: 150,
  CAT_STAGE_SENIOR_DAYS: 210,
  CAT_STAGE_VETERAN_DAYS: 280,
  CAT_STAGE_LEGACY_DAYS: 365,
};

const INITIAL_POINTS = 5000;
const DEFAULT_CAT_NAME = '로그링고';

function migrateStoredCatName(storedCat: Cat | null): Cat | null {
  if (!storedCat) {
    return null;
  }

  if (storedCat.name !== '나비') {
    return storedCat;
  }

  return {
    ...storedCat,
    name: DEFAULT_CAT_NAME
  };
}

function isSameLocalDay(left: number, right: number): boolean {
  const leftDate = new Date(left);
  const rightDate = new Date(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

function didCatStageAdvance(previous: Cat | null, current: Cat): boolean {
  if (!previous) {
    return false;
  }

  return CAT_STAGES.indexOf(current.stage) > CAT_STAGES.indexOf(previous.stage);
}

export function useCat() {
  const [cat, setCat] = useState<Cat | null>(null);
  const [points, setPoints] = useState<number>(INITIAL_POINTS);
  const [ledgers, setLedgers] = useState<PointLedger[]>([]);
  const { syncCat } = useCatSync();
  const { syncPendingPoints } = usePointSync();
  const auth = useAppAuth();

  const buildInitialCat = useCallback((userId: string): Cat => {
    const now = Date.now();

    return {
      id: 'mock-cat-1',
      userId,
      name: DEFAULT_CAT_NAME,
      stage: 'kitten',
      status: 'healthy',
      createdAt: now,
      updatedAt: now,
      lastFedAt: now,
      lastWashedAt: now,
      lastPlayedAt: now,
      activeDays: 0
    };
  }, []);

  const persistCatState = useCallback(
    (nextCat: Cat) => {
      saveStoredCat(nextCat);

      if (!auth.isAuthenticated) {
        return;
      }

      void syncCat(auth.userId, {
        ...nextCat,
        userId: auth.userId
      });
    },
    [auth.isAuthenticated, auth.userId, syncCat]
  );

  const persistPointLedgers = useCallback(
    (userId: string, nextLedgers: PointLedger[], pendingLedgers: PointLedger[] = nextLedgers) => {
      saveStoredCatLedgers(nextLedgers);

      if (!auth.isAuthenticated) {
        return;
      }

      void syncPendingPoints(
        auth.userId,
        pendingLedgers.map((ledger) => ({
          ...ledger,
          userId: auth.userId
        }))
      );
    },
    [auth.isAuthenticated, auth.userId, syncPendingPoints]
  );

  const publishCatGrowthUpdate = useCallback(
    (previousCat: Cat | null, nextCat: Cat) => {
      if (!didCatStageAdvance(previousCat, nextCat)) {
        return;
      }

      const createdAt = new Date(nextCat.updatedAt).toISOString();
      const eventKey = `cat-growth:${nextCat.userId}:${nextCat.stage}`;

      void publishFeedPost({
        post: createCatGrowthPost({
          id: eventKey,
          userId: nextCat.userId,
          catName: nextCat.name,
          stage: nextCat.stage,
          activeDays: nextCat.activeDays,
          createdAt,
          eventKey,
          ...(auth.displayName ? { userDisplayName: auth.displayName } : {})
        }),
        syncRemote: auth.isAuthenticated
      });
    },
    [auth.displayName, auth.isAuthenticated]
  );

  const hydrateFromStorage = useCallback(() => {
    if (!auth.authReady) {
      return;
    }

    void (async () => {
      try {
        const persistedCat = loadStoredCat();
        const storedCat = migrateStoredCatName(persistedCat);
        const storedLedgers = loadStoredCatLedgers();

        if (auth.isAuthenticated && hasFirebaseWebConfig()) {
          const [remoteCatState, remotePointState] = await Promise.all([
            loadFirebaseCatState(auth.userId),
            loadFirebasePointLedgerState(auth.userId)
          ]);
          const baseCat = remoteCatState?.cat
            ? remoteCatState.cat
            : storedCat
              ? { ...storedCat, userId: auth.userId }
              : buildInitialCat(auth.userId);
          const nextCat = calculateGrowthDays(
            baseCat,
            Date.now(),
            LOCAL_APP_ENV as EnvThresholds
          );
          const nextLedgers =
            remotePointState?.ledgers && remotePointState.ledgers.length > 0
              ? remotePointState.ledgers
              : storedLedgers.map((ledger) => ({
                  ...ledger,
                  userId: auth.userId
                }));

          setCat(nextCat);
          setLedgers(nextLedgers);
          setPoints(getPointBalance(nextLedgers) + INITIAL_POINTS);
          saveStoredCat(nextCat, false);
          saveStoredCatLedgers(nextLedgers, false);

          if (!remoteCatState) {
            void syncCat(auth.userId, nextCat);
          }

          if (!remotePointState && nextLedgers.length > 0) {
            void syncPendingPoints(auth.userId, nextLedgers);
          }

          publishCatGrowthUpdate(baseCat, nextCat);

          return;
        }

        const baseCat = storedCat ?? buildInitialCat('demo-user');
        const initialCat = calculateGrowthDays(
          baseCat,
          Date.now(),
          LOCAL_APP_ENV as EnvThresholds
        );
        const nextLedgers = storedLedgers;

        setCat(initialCat);
        setLedgers(nextLedgers);
        setPoints(getPointBalance(nextLedgers) + INITIAL_POINTS);

        if (!storedCat) {
          saveStoredCat(initialCat, false);
        }

        if (storedLedgers.length === 0) {
          saveStoredCatLedgers([], false);
        }

        publishCatGrowthUpdate(baseCat, initialCat);
      } catch (e) {
        console.error('Failed to parse cat state', e);
      }
    })();
  }, [
    auth.authReady,
    auth.isAuthenticated,
    auth.userId,
    buildInitialCat,
    publishCatGrowthUpdate,
    syncCat,
    syncPendingPoints
  ]);

  // 1. Load from localStorage
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const handleStorageUpdated = () => {
      hydrateFromStorage();
    };

    window.addEventListener(CAT_STORAGE_UPDATED_EVENT, handleStorageUpdated);
    window.addEventListener('storage', handleStorageUpdated);

    return () => {
      window.removeEventListener(CAT_STORAGE_UPDATED_EVENT, handleStorageUpdated);
      window.removeEventListener('storage', handleStorageUpdated);
    };
  }, [hydrateFromStorage]);

  // 2. Poll & update status every minute
  useEffect(() => {
    if (!cat) return;
    const interval = setInterval(() => {
      const updated = calculateGrowthDays(cat, Date.now(), LOCAL_APP_ENV as EnvThresholds);
      setCat(updated);
      persistCatState(updated);
      publishCatGrowthUpdate(cat, updated);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cat, persistCatState, publishCatGrowthUpdate]);

  // Action Helpers
  const performAction = useCallback((
    actionFn: (
      c: Cat,
      pts: number,
      time: number,
      env: EnvThresholds
    ) => ActionResult,
    reasonInfo: string
  ) => {
    if (!cat) return false;
    try {
      const now = Date.now();
      const updatedCatBeforeAction = calculateGrowthDays(
        cat,
        now,
        LOCAL_APP_ENV as EnvThresholds
      );
      
      const res = actionFn(
        updatedCatBeforeAction,
        points,
        now,
        LOCAL_APP_ENV as EnvThresholds
      );
      if (!res.success) {
        // failed (e.g. not enough points or already dead)
        return false;
      }

      const newCat = res.newCat;
      const ledgerEntry = createPointLedgerEntry(newCat.userId, -res.cost, reasonInfo as any, now);
      
      const newLedgers = [...ledgers, ledgerEntry];
      
      setCat(newCat);
      setLedgers(newLedgers);
      setPoints(prev => prev - res.cost);

      persistCatState(newCat);
      persistPointLedgers(newCat.userId, newLedgers, [ledgerEntry]);
      publishCatGrowthUpdate(updatedCatBeforeAction, newCat);
      return true;
    } catch (e) {
      console.error('Action failed', e);
      return false;
    }
  }, [
    cat,
    points,
    ledgers,
    persistCatState,
    persistPointLedgers,
    publishCatGrowthUpdate
  ]);

  const grantLearningReward = useCallback(
    (activity: LearningActivity): number => {
      if (!cat) {
        return 0;
      }

      const now = Date.now();
      const updatedCat = calculateGrowthDays(cat, now, LOCAL_APP_ENV as EnvThresholds);
      const earnedToday = ledgers
        .filter(
          (ledger) =>
            ledger.reason === 'learning_reward' && isSameLocalDay(ledger.createdAt, now)
        )
        .reduce((sum, ledger) => sum + Math.max(0, ledger.amount), 0);
      const reward = processLearningEventToCatPoints(
        updatedCat.userId,
        `learning-${now}-${Math.random().toString(36).slice(2, 8)}`,
        activity,
        LOCAL_APP_ENV,
        [],
        earnedToday
      );

      if (!reward.success || !reward.entry) {
        return 0;
      }

      const nextLedgers = [...ledgers, reward.entry];

      setCat(updatedCat);
      setLedgers(nextLedgers);
      setPoints(getPointBalance(nextLedgers) + INITIAL_POINTS);

      persistCatState(updatedCat);
      persistPointLedgers(updatedCat.userId, nextLedgers, [reward.entry]);
      notifyAppToast(buildPointEarnedToast(reward.grantedPoints ?? reward.entry.amount));

      return reward.grantedPoints ?? reward.entry.amount;
    },
    [cat, ledgers, persistCatState, persistPointLedgers]
  );

  const grantLearningPoints = useCallback(
    (amount: number): number => {
      if (!cat || amount <= 0) {
        return 0;
      }

      const now = Date.now();
      const updatedCat = calculateGrowthDays(cat, now, LOCAL_APP_ENV as EnvThresholds);
      const entry = createPointLedgerEntry(updatedCat.userId, amount, 'learning_reward', now);
      const nextLedgers = [...ledgers, entry];

      setCat(updatedCat);
      setLedgers(nextLedgers);
      setPoints(getPointBalance(nextLedgers) + INITIAL_POINTS);

      persistCatState(updatedCat);
      persistPointLedgers(updatedCat.userId, nextLedgers, [entry]);
      notifyAppToast(buildPointEarnedToast(amount));

      return amount;
    },
    [cat, ledgers, persistCatState, persistPointLedgers]
  );

  const handleFeed = () => performAction(feedCat, 'cat_care_feed');
  const handleWash = () => performAction(batheCat, 'cat_care_wash');
  const handlePlay = () => performAction(playWithCat, 'cat_care_play');
  const handleHeal = () => performAction(giveMedicine, 'cat_care_heal'); // simplified

  const resetCat = useCallback(() => {
    const userId = auth.isAuthenticated ? auth.userId : 'demo-user';
    const freshCat = buildInitialCat(userId);

    setCat(freshCat);
    setLedgers([]);
    setPoints(INITIAL_POINTS);

    persistCatState(freshCat);
    persistPointLedgers(userId, [], []);
  }, [
    auth.isAuthenticated,
    auth.userId,
    buildInitialCat,
    persistCatState,
    persistPointLedgers
  ]);

  // Provide current calculated static properties derived on the fly
  const currentStatus = cat ? calculateCatStatus(cat, Date.now(), LOCAL_APP_ENV as EnvThresholds) : 'healthy';

  return {
    cat,
    points,
    currentStatus,
    grantLearningReward,
    grantLearningPoints,
    handleFeed,
    handleWash,
    handlePlay,
    handleHeal,
    resetCat,
  };
}
