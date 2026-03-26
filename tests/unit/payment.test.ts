import { describe, expect, it } from 'vitest';

import {
  canAccessPremiumFeature,
  createCheckoutSession,
  getPaymentProductById,
  getPaymentProducts,
  handlePolarWebhook,
  InMemoryPaymentEntitlementRepository,
  resolveEntitlementsForProducts
} from '../../services/payment/src';

describe('payment product entitlements', () => {
  it('returns the configured product catalog', () => {
    expect(getPaymentProducts().map((product) => product.id)).toEqual([
      'premium.monthly',
      'language_pack.plus',
      'ai_tutor.pro'
    ]);
  });

  it('maps the premium monthly product to ad-free and language entitlements', () => {
    const product = getPaymentProductById('premium.monthly');

    expect(product.entitlements.adFree).toBe(true);
    expect(product.entitlements.unlockedLanguages).toContain('ja');
    expect(product.entitlements.aiTutorExtended).toBe(false);
  });

  it('combines entitlements across multiple purchased products', () => {
    const entitlements = resolveEntitlementsForProducts([
      'language_pack.plus',
      'ai_tutor.pro'
    ]);

    expect(entitlements.adFree).toBe(true);
    expect(entitlements.aiTutorExtended).toBe(true);
    expect(entitlements.unlockedLanguages).toContain('de');
  });
});

describe('checkout session creation', () => {
  it('creates a checkout session for a valid product request', () => {
    const session = createCheckoutSession({
      productId: 'premium.monthly',
      userId: 'user-1',
      successUrl: 'https://wordflow.app/billing/success',
      cancelUrl: 'https://wordflow.app/billing/cancel'
    });

    expect(session.productId).toBe('premium.monthly');
    expect(session.checkoutUrl).toContain('polar.sh/checkout/');
    expect(session.checkoutId).toBe('premium.monthly:user-1');
  });

  it('fails when the product request is invalid', () => {
    expect(() =>
      createCheckoutSession({
        productId: 'invalid.product' as 'premium.monthly',
        userId: 'user-1',
        successUrl: 'https://wordflow.app/billing/success',
        cancelUrl: 'https://wordflow.app/billing/cancel'
      })
    ).toThrow();
  });
});

describe('polar webhook handling', () => {
  it('updates user entitlements after checkout completion', async () => {
    const repository = new InMemoryPaymentEntitlementRepository();

    const result = await handlePolarWebhook(
      {
        type: 'checkout.session.completed',
        data: {
          userId: 'user-1',
          productId: 'ai_tutor.pro'
        }
      },
      'polar-test-signature',
      'polar-test-signature',
      repository,
      '2026-03-26T00:00:00.000Z'
    );

    expect(result.userId).toBe('user-1');
    expect(result.aiTutorExtended).toBe(true);
    expect(result.adFree).toBe(true);
  });

  it('fails when the webhook signature is invalid', async () => {
    const repository = new InMemoryPaymentEntitlementRepository();

    await expect(
      handlePolarWebhook(
        {
          type: 'checkout.session.completed',
          data: {
            userId: 'user-1',
            productId: 'premium.monthly'
          }
        },
        'wrong-signature',
        'polar-test-signature',
        repository,
        '2026-03-26T00:00:00.000Z'
      )
    ).rejects.toThrow('Invalid webhook signature.');
  });
});

describe('premium feature access control', () => {
  it('blocks premium feature access for free users', () => {
    expect(
      canAccessPremiumFeature({
        entitlements: {
          adFree: false,
          unlockedLanguages: [],
          aiTutorExtended: false
        },
        feature: 'ai_tutor_extended'
      })
    ).toBe(false);

    expect(
      canAccessPremiumFeature({
        entitlements: {
          adFree: false,
          unlockedLanguages: [],
          aiTutorExtended: false
        },
        feature: 'language_unlock',
        languageCode: 'ja'
      })
    ).toBe(false);
  });

  it('allows premium features for entitled users', () => {
    const entitlements = resolveEntitlementsForProducts([
      'premium.monthly',
      'ai_tutor.pro'
    ]);

    expect(
      canAccessPremiumFeature({
        entitlements,
        feature: 'ad_free'
      })
    ).toBe(true);
    expect(
      canAccessPremiumFeature({
        entitlements,
        feature: 'language_unlock',
        languageCode: 'ja'
      })
    ).toBe(true);
    expect(
      canAccessPremiumFeature({
        entitlements,
        feature: 'ai_tutor_extended'
      })
    ).toBe(true);
  });
});
