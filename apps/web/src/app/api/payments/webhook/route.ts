import { NextResponse } from 'next/server';

import {
  InMemoryPaymentEntitlementRepository,
  handlePolarWebhook
} from '@wordflow/payment/webhook';

const repository = new InMemoryPaymentEntitlementRepository();
const expectedSignature = 'polar-test-signature';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const signature = request.headers.get('polar-signature');
    const result = await handlePolarWebhook(
      json,
      signature,
      expectedSignature,
      repository,
      '2026-03-26T00:00:00.000Z'
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : '결제 웹훅 처리에 실패했습니다.'
      },
      {
        status: 400
      }
    );
  }
}
