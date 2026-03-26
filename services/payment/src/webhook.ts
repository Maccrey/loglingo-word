import { z } from 'zod';

import {
  resolveEntitlementsForProducts,
  type PaymentProductId,
  type UserEntitlement
} from './catalog';

export const polarWebhookSchema = z.object({
  type: z.literal('checkout.session.completed'),
  data: z.object({
    userId: z.string().min(1),
    productId: z.enum(['premium.monthly', 'language_pack.plus', 'ai_tutor.pro'])
  })
});

export type PolarWebhookEvent = z.infer<typeof polarWebhookSchema>;

export type UserEntitlementRecord = UserEntitlement & {
  userId: string;
  productIds: PaymentProductId[];
  updatedAt: string;
};

export type PaymentEntitlementRepository = {
  findByUserId(userId: string): Promise<UserEntitlementRecord | null>;
  save(record: UserEntitlementRecord): Promise<UserEntitlementRecord>;
};

export function verifyPolarWebhookSignature(
  signature: string | null,
  expectedSignature: string
): void {
  if (!signature || signature !== expectedSignature) {
    throw new Error('Invalid webhook signature.');
  }
}

export async function handlePolarWebhook(
  payload: unknown,
  signature: string | null,
  expectedSignature: string,
  repository: PaymentEntitlementRepository,
  updatedAt: string
): Promise<UserEntitlementRecord> {
  verifyPolarWebhookSignature(signature, expectedSignature);

  const event = polarWebhookSchema.parse(payload);
  const existing = await repository.findByUserId(event.data.userId);
  const productIds = new Set<PaymentProductId>(existing?.productIds ?? []);

  productIds.add(event.data.productId);

  const record: UserEntitlementRecord = {
    userId: event.data.userId,
    productIds: [...productIds],
    ...resolveEntitlementsForProducts([...productIds]),
    updatedAt
  };

  return repository.save(record);
}

export class InMemoryPaymentEntitlementRepository implements PaymentEntitlementRepository {
  private readonly store = new Map<string, UserEntitlementRecord>();

  async findByUserId(userId: string): Promise<UserEntitlementRecord | null> {
    return this.store.get(userId) ?? null;
  }

  async save(record: UserEntitlementRecord): Promise<UserEntitlementRecord> {
    this.store.set(record.userId, record);
    return record;
  }
}
