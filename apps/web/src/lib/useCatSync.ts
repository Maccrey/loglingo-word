'use client';

import { useCallback, useState } from 'react';

import type { Cat } from '@wordflow/shared/cat';

type CatSyncState = {
  loading: boolean;
  syncedAt: string | null;
  error: string | null;
};

export function useCatSync() {
  const [state, setState] = useState<CatSyncState>({
    loading: false,
    syncedAt: null,
    error: null
  });

  const syncCat = useCallback(async (userId: string, cat: Cat) => {
    const syncedAt = new Date().toISOString();

    setState({
      loading: true,
      syncedAt: null,
      error: null
    });

    try {
      const response = await fetch('/api/cat/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          cat,
          syncedAt
        })
      });

      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        throw new Error(result.message ?? '고양이 상태 동기화에 실패했습니다.');
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
            : '고양이 상태 동기화에 실패했습니다.'
      });

      return false;
    }
  }, []);

  return {
    syncCat,
    syncState: state
  };
}
