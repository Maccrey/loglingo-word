import { NextResponse } from 'next/server';

import { catSyncInputSchema, syncCatState } from '@wordflow/core/cat-sync';

import { getCatStateRepository } from '../../../../lib/cat-repository';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = catSyncInputSchema.parse(json);
    const result = await syncCatState(input, getCatStateRepository());

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '고양이 상태 동기화에 실패했습니다.';

    return NextResponse.json({ message }, { status: 400 });
  }
}
