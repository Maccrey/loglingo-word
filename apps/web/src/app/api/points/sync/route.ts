import { NextResponse } from 'next/server';

import {
  pointLedgerSyncInputSchema,
  syncPointLedgers
} from '@wordflow/core/point-sync';

import { getPointLedgerSyncRepository } from '../../../../lib/point-ledger-repository';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = pointLedgerSyncInputSchema.parse(json);
    const result = await syncPointLedgers(
      input,
      getPointLedgerSyncRepository()
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '포인트 렛저 동기화에 실패했습니다.';

    return NextResponse.json({ message }, { status: 400 });
  }
}
