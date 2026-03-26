import { z } from 'zod';

const analyticsEventBaseSchema = z.object({
  name: z.enum([
    'onboarding_complete',
    'lesson_complete',
    'leaderboard_viewed',
    'sns_shared',
    'payment_success'
  ]),
  userId: z.string().min(1),
  occurredAt: z.string().datetime()
});

export const onboardingCompleteEventSchema = analyticsEventBaseSchema.extend({
  name: z.literal('onboarding_complete'),
  nativeLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  goal: z.string().min(1)
});

export const lessonCompleteEventSchema = analyticsEventBaseSchema.extend({
  name: z.literal('lesson_complete'),
  lessonId: z.string().min(1),
  completedCount: z.number().int().min(1)
});

export const leaderboardViewedEventSchema = analyticsEventBaseSchema.extend({
  name: z.literal('leaderboard_viewed'),
  weekId: z.string().min(1)
});

export const snsSharedEventSchema = analyticsEventBaseSchema.extend({
  name: z.literal('sns_shared'),
  postId: z.string().min(1)
});

export const paymentSuccessEventSchema = analyticsEventBaseSchema.extend({
  name: z.literal('payment_success'),
  productId: z.string().min(1),
  checkoutId: z.string().min(1)
});

export type OnboardingCompleteEvent = z.infer<
  typeof onboardingCompleteEventSchema
>;
export type LessonCompleteEvent = z.infer<typeof lessonCompleteEventSchema>;
export type LeaderboardViewedEvent = z.infer<
  typeof leaderboardViewedEventSchema
>;
export type SnsSharedEvent = z.infer<typeof snsSharedEventSchema>;
export type PaymentSuccessEvent = z.infer<typeof paymentSuccessEventSchema>;

export function createOnboardingCompleteEvent(
  input: Omit<OnboardingCompleteEvent, 'name'>
): OnboardingCompleteEvent {
  return onboardingCompleteEventSchema.parse({
    name: 'onboarding_complete',
    ...input
  });
}

export function createLessonCompleteEvent(
  input: Omit<LessonCompleteEvent, 'name'>
): LessonCompleteEvent {
  return lessonCompleteEventSchema.parse({
    name: 'lesson_complete',
    ...input
  });
}

export function createLeaderboardViewedEvent(
  input: Omit<LeaderboardViewedEvent, 'name'>
): LeaderboardViewedEvent {
  return leaderboardViewedEventSchema.parse({
    name: 'leaderboard_viewed',
    ...input
  });
}

export function createSnsSharedEvent(
  input: Omit<SnsSharedEvent, 'name'>
): SnsSharedEvent {
  return snsSharedEventSchema.parse({
    name: 'sns_shared',
    ...input
  });
}

export function createPaymentSuccessEvent(
  input: Omit<PaymentSuccessEvent, 'name'>
): PaymentSuccessEvent {
  return paymentSuccessEventSchema.parse({
    name: 'payment_success',
    ...input
  });
}
