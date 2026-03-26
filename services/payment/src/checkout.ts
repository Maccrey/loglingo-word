import { z } from 'zod';

import { getPaymentProductById, type PaymentProductId } from './catalog';

export const checkoutSessionRequestSchema = z.object({
  productId: z.enum(['premium.monthly', 'language_pack.plus', 'ai_tutor.pro']),
  userId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export type CheckoutSessionRequest = z.infer<
  typeof checkoutSessionRequestSchema
>;

export type CheckoutSession = {
  checkoutId: string;
  productId: PaymentProductId;
  productName: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
};

export function createCheckoutSession(
  input: CheckoutSessionRequest
): CheckoutSession {
  const request = checkoutSessionRequestSchema.parse(input);
  const product = getPaymentProductById(request.productId);
  const checkoutId = `${request.productId}:${request.userId}`;

  return {
    checkoutId,
    productId: product.id,
    productName: product.name,
    checkoutUrl: `https://polar.sh/checkout/${encodeURIComponent(checkoutId)}`,
    successUrl: request.successUrl,
    cancelUrl: request.cancelUrl
  };
}
