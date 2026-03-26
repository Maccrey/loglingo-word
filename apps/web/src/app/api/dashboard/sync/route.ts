import { NextResponse } from 'next/server';

import {
  dashboardSyncInputSchema,
  syncDashboardStats
} from '@wordflow/core/dashboard';

import { getDashboardStatsRepository } from '../../../../lib/dashboard-repository';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = dashboardSyncInputSchema.parse(json);
    const result = await syncDashboardStats(
      input,
      getDashboardStatsRepository()
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '대시보드 집계 동기화에 실패했습니다.';

    return NextResponse.json({ message }, { status: 400 });
  }
}
