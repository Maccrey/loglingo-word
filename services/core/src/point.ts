import type { PointLedgerReason, PointLedger } from '@wordflow/shared/cat';

/**
 * 포인트 증감 내역(Ledger) 엔트리를 생성합니다.
 */
export function createPointLedgerEntry(
  userId: string,
  amount: number,
  reason: PointLedgerReason,
  timestamp: string | number = Date.now()
): PointLedger {
  return {
    id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    amount,
    reason,
    createdAt: typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp,
  };
}

/**
 * 유저의 모든 포인트 내역을 합산하여 현재 잔액을 계산합니다.
 */
export function getPointBalance(ledgers: PointLedger[]): number {
  return ledgers.reduce((sum, entry) => sum + entry.amount, 0);
}
