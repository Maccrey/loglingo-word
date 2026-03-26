import { NextResponse } from 'next/server';

import {
  FirestoreDashboardStatsRepository,
  InMemoryDashboardStatsRepository,
  dashboardSyncInputSchema,
  syncDashboardStats
} from '@wordflow/core/dashboard';

import {
  createFirestoreDashboardStatsStore,
  hasFirebaseAdminConfig
} from '../../../../lib/firebase-admin';

const repository = hasFirebaseAdminConfig()
  ? new FirestoreDashboardStatsRepository(createFirestoreDashboardStatsStore())
  : new InMemoryDashboardStatsRepository();

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = dashboardSyncInputSchema.parse(json);
    const result = await syncDashboardStats(input, repository);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '대시보드 집계 동기화에 실패했습니다.';

    return NextResponse.json({ message }, { status: 400 });
  }
}
