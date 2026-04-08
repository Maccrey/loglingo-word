import { NextResponse } from 'next/server';

import {
  InMemoryPaymentEntitlementRepository,
  handlePolarWebhook
} from '@wordflow/payment/webhook';

import {
  hasFirebaseAdminConfig,
  getFirestoreUserSettings,
  updateFirestoreUserSettings
} from '../../../../lib/firebase-admin';

import { isSubscriptionActive } from '@wordflow/shared/types';

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
      new Date().toISOString()
    );

    if (hasFirebaseAdminConfig()) {
      const productId = json.data?.productId;
      const userId = json.data?.userId;

      if (userId && productId) {
        const currentSettings = await getFirestoreUserSettings(userId);
        let validUntil = new Date();
        
        // If the user currently has an active subscription with an explicit date, extend from that date
        if (currentSettings?.premiumValidUntil && isSubscriptionActive(currentSettings as any)) {
          validUntil = new Date(currentSettings.premiumValidUntil);
        }

        if (productId === 'premium.monthly') {
          validUntil.setDate(validUntil.getDate() + 30);
        } else if (productId === 'premium.yearly') {
          validUntil.setFullYear(validUntil.getFullYear() + 1);
        }

        const settingsPatch: any = {
          premiumEnabled: true
        };

        if (productId === 'premium.monthly' || productId === 'premium.yearly') {
          settingsPatch.premiumValidUntil = validUntil.toISOString();
        }

        await updateFirestoreUserSettings(userId, settingsPatch);
      }
    }

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
