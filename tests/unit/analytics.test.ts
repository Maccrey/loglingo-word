import { describe, expect, it } from 'vitest';

import {
  createLeaderboardViewedEvent,
  createOnboardingCompleteEvent,
  createPaymentSuccessEvent,
  createSnsSharedEvent
} from '../../packages/shared/src/analytics';

describe('analytics event payloads', () => {
  it('creates the configured analytics payloads', () => {
    expect(
      createOnboardingCompleteEvent({
        userId: 'user-1',
        nativeLanguage: 'ko',
        targetLanguage: 'en',
        goal: 'conversation',
        occurredAt: '2026-03-26T00:00:00.000Z'
      }).name
    ).toBe('onboarding_complete');

    expect(
      createLeaderboardViewedEvent({
        userId: 'user-1',
        weekId: '2026-W13',
        occurredAt: '2026-03-26T00:00:00.000Z'
      }).weekId
    ).toBe('2026-W13');

    expect(
      createSnsSharedEvent({
        userId: 'user-1',
        postId: 'post-1',
        occurredAt: '2026-03-26T00:00:00.000Z'
      }).postId
    ).toBe('post-1');

    expect(
      createPaymentSuccessEvent({
        userId: 'user-1',
        productId: 'premium.monthly',
        checkoutId: 'premium.monthly:user-1',
        occurredAt: '2026-03-26T00:00:00.000Z'
      }).checkoutId
    ).toBe('premium.monthly:user-1');
  });

  it('rejects payloads with missing required properties', () => {
    expect(() =>
      createOnboardingCompleteEvent({
        userId: 'user-1',
        nativeLanguage: 'ko',
        targetLanguage: '',
        goal: 'conversation',
        occurredAt: '2026-03-26T00:00:00.000Z'
      })
    ).toThrow();
  });
});
