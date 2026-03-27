import type { Cat, PointLedger } from '@wordflow/shared/cat';

const CAT_STATE_KEY = 'mock_cat_state';
const CAT_LEDGER_KEY = 'mock_cat_ledgers';

export function loadStoredCat(): Cat | null {
  const storedCat = window.localStorage.getItem(CAT_STATE_KEY);

  if (!storedCat) {
    return null;
  }

  return JSON.parse(storedCat) as Cat;
}

export function saveStoredCat(cat: Cat) {
  window.localStorage.setItem(CAT_STATE_KEY, JSON.stringify(cat));
}

export function loadStoredCatLedgers(): PointLedger[] {
  const storedLedgers = window.localStorage.getItem(CAT_LEDGER_KEY);

  if (!storedLedgers) {
    return [];
  }

  return JSON.parse(storedLedgers) as PointLedger[];
}

export function saveStoredCatLedgers(ledgers: PointLedger[]) {
  window.localStorage.setItem(CAT_LEDGER_KEY, JSON.stringify(ledgers));
}
