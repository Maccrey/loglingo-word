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
import { createPointLedgerEntry, getPointBalance } from '../../../../services/core/src/point';

// Provide some default dummy env if we don't have access to the actual env
const MOCK_ENV: Partial<EnvThresholds> = {
  CAT_COST_FEED: 100,
  CAT_COST_PLAY: 200,
  CAT_COST_WASH: 150,
  CAT_COST_HEAL: 1000,
  CAT_HUNGRY_HOURS: 12,
  CAT_SMELLY_HOURS: 24,
  CAT_STRESSED_HOURS: 24,
  CAT_SICK_HOURS: 48,
  CAT_CRITICAL_HOURS: 24,
  CAT_DEAD_DAYS: 3,
};

const INITIAL_POINTS = 5000;

export function useCat() {
  const [cat, setCat] = useState<Cat | null>(null);
  const [points, setPoints] = useState<number>(INITIAL_POINTS);
  const [ledgers, setLedgers] = useState<PointLedger[]>([]);

  // 1. Load from localStorage
  useEffect(() => {
    try {
      const storedCat = localStorage.getItem('mock_cat_state');
      const storedLedgers = localStorage.getItem('mock_cat_ledgers');

      if (storedCat) {
        setCat(JSON.parse(storedCat));
      } else {
        // Create initial kitten
        const now = Date.now();
        const initialCat: Cat = {
          id: 'mock-cat-1',
          userId: 'demo-user',
          name: '나비',
          stage: 'kitten',
          status: 'healthy',
          createdAt: now,
          updatedAt: now,
          lastFedAt: now,
          lastWashedAt: now,
          lastPlayedAt: now,
          activeDays: 0,
        };
        setCat(initialCat);
        localStorage.setItem('mock_cat_state', JSON.stringify(initialCat));
      }

      if (storedLedgers) {
        const parsed = JSON.parse(storedLedgers) as PointLedger[];
        setLedgers(parsed);
        setPoints(getPointBalance(parsed) + INITIAL_POINTS); // starting with 5000 base
      } else {
        setLedgers([]);
        setPoints(INITIAL_POINTS);
      }
    } catch (e) {
      console.error('Failed to parse cat state', e);
    }
  }, []);

  // 2. Poll & update status every minute
  useEffect(() => {
    if (!cat) return;
    const interval = setInterval(() => {
      const updated = calculateGrowthDays(cat, Date.now(), MOCK_ENV);
      setCat(updated);
      localStorage.setItem('mock_cat_state', JSON.stringify(updated));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cat]);

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
      const updatedCatBeforeAction = calculateGrowthDays(cat, now, MOCK_ENV as EnvThresholds);
      
      const res = actionFn(updatedCatBeforeAction, points, now, MOCK_ENV as EnvThresholds);
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

      localStorage.setItem('mock_cat_state', JSON.stringify(newCat));
      localStorage.setItem('mock_cat_ledgers', JSON.stringify(newLedgers));
      return true;
    } catch (e) {
      console.error('Action failed', e);
      return false;
    }
  }, [cat, points, ledgers]);

  const handleFeed = () => performAction(feedCat, 'cat_care_feed');
  const handleWash = () => performAction(batheCat, 'cat_care_wash');
  const handlePlay = () => performAction(playWithCat, 'cat_care_play');
  const handleHeal = () => performAction(giveMedicine, 'cat_care_heal'); // simplified

  // Provide current calculated static properties derived on the fly
  const currentStatus = cat ? calculateCatStatus(cat, Date.now(), MOCK_ENV as EnvThresholds) : 'healthy';

  return {
    cat,
    points,
    currentStatus,
    handleFeed,
    handleWash,
    handlePlay,
    handleHeal,
  };
}
