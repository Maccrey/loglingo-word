import { NextResponse } from 'next/server';

import {
  checkoutSessionRequestSchema,
  createCheckoutSession
} from '@wordflow/payment/checkout';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = checkoutSessionRequestSchema.parse(json);
    const session = createCheckoutSession(input);

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : '체크아웃 세션 생성에 실패했습니다.'
      },
      {
        status: 400
      }
    );
  }
}
