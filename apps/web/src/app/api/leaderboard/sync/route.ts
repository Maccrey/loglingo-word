import { NextResponse } from 'next/server';

import {
  getLeaderboardWeek,
  syncLeaderboardScore
} from '@wordflow/leaderboard';

import { getLeaderboardRepository } from '../../../../lib/leaderboard-repository';

function parseSyncInput(json: unknown) {
  if (typeof json !== 'object' || json === null) {
    throw new Error('리더보드 동기화 요청 형식이 올바르지 않습니다.');
  }

  const input = json as {
    userId?: unknown;
    scoreDelta?: unknown;
    now?: unknown;
  };

  if (typeof input.userId !== 'string' || input.userId.trim().length === 0) {
    throw new Error('리더보드 사용자 ID가 필요합니다.');
  }

  if (
    typeof input.scoreDelta !== 'number' ||
    !Number.isFinite(input.scoreDelta)
  ) {
    throw new Error('리더보드 점수는 숫자여야 합니다.');
  }

  if (typeof input.now !== 'string' || input.now.trim().length === 0) {
    throw new Error('리더보드 기준 시각이 필요합니다.');
  }

  return {
    userId: input.userId.trim(),
    scoreDelta: Math.max(0, Math.floor(input.scoreDelta)),
    now: input.now
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = parseSyncInput(json);
    const weekId = getLeaderboardWeek(input.now).weekId;
    const result = await syncLeaderboardScore(
      {
        weekId,
        userId: input.userId,
        scoreDelta: input.scoreDelta
      },
      getLeaderboardRepository()
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '리더보드 점수 동기화에 실패했습니다.';

    return NextResponse.json({ message }, { status: 400 });
  }
}
