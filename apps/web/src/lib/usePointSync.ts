'use client';

import { useCallback, useState } from 'react';

import type { PointLedger } from '@wordflow/shared/cat';

type PointSyncState = {
  loading: boolean;
  syncedAt: string | null;
  error: string | null;
};

export function usePointSync() {
  const [state, setState] = useState<PointSyncState>({
    loading: false,
    syncedAt: null,
    error: null
  });

  const syncPendingPoints = useCallback(
    async (userId: string, ledgers: PointLedger[]) => {
      if (ledgers.length === 0) {
        return true;
      }

      const syncedAt = new Date().toISOString();

      setState({
        loading: true,
        syncedAt: null,
        error: null
      });

      try {
        const response = await fetch('/api/points/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            ledgers,
            syncedAt
          })
        });

        if (!response.ok) {
          const result = (await response.json()) as { message?: string };
          throw new Error(result.message ?? '포인트 렛저 동기화에 실패했습니다.');
        }

        setState({
          loading: false,
          syncedAt,
          error: null
        });

        return true;
      } catch (error) {
        setState({
          loading: false,
          syncedAt: null,
          error:
            error instanceof Error
              ? error.message
              : '포인트 렛저 동기화에 실패했습니다.'
        });

        return false;
      }
    },
    []
  );

  return {
    syncPendingPoints,
    syncState: state
  };
}
