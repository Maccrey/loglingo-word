export type PaymentProductId =
  | 'premium.monthly'
  | 'language_pack.plus'
  | 'ai_tutor.pro';

export type UserEntitlement = {
  adFree: boolean;
  unlockedLanguages: string[];
  aiTutorExtended: boolean;
};

export type PaymentProduct = {
  id: PaymentProductId;
  name: string;
  description: string;
  priceLabel: string;
  entitlements: UserEntitlement;
};

const paymentProducts: PaymentProduct[] = [
  {
    id: 'premium.monthly',
    name: 'Premium Monthly',
    description: '광고 제거와 추가 언어 학습 권한을 제공합니다.',
    priceLabel: '$9.99/mo',
    entitlements: {
      adFree: true,
      unlockedLanguages: ['ja', 'es', 'fr'],
      aiTutorExtended: false
    }
  },
  {
    id: 'language_pack.plus',
    name: 'Language Pack Plus',
    description: '추가 학습 언어를 해제합니다.',
    priceLabel: '$4.99',
    entitlements: {
      adFree: false,
      unlockedLanguages: ['ja', 'es', 'fr', 'de'],
      aiTutorExtended: false
    }
  },
  {
    id: 'ai_tutor.pro',
    name: 'AI Tutor Pro',
    description: '확장된 AI 대화와 교정 기능을 제공합니다.',
    priceLabel: '$12.99/mo',
    entitlements: {
      adFree: true,
      unlockedLanguages: [],
      aiTutorExtended: true
    }
  }
];

export function getPaymentProducts(): PaymentProduct[] {
  return paymentProducts.map((product) => ({
    ...product,
    entitlements: {
      ...product.entitlements,
      unlockedLanguages: [...product.entitlements.unlockedLanguages]
    }
  }));
}

export function getPaymentProductById(
  productId: PaymentProductId
): PaymentProduct {
  const product = paymentProducts.find((item) => item.id === productId);

  if (!product) {
    throw new Error('Unknown payment product.');
  }

  return {
    ...product,
    entitlements: {
      ...product.entitlements,
      unlockedLanguages: [...product.entitlements.unlockedLanguages]
    }
  };
}

export function resolveEntitlementsForProducts(
  productIds: PaymentProductId[]
): UserEntitlement {
  const entitlement: UserEntitlement = {
    adFree: false,
    unlockedLanguages: [],
    aiTutorExtended: false
  };
  const unlockedLanguages = new Set<string>();

  for (const productId of productIds) {
    const product = getPaymentProductById(productId);

    entitlement.adFree = entitlement.adFree || product.entitlements.adFree;
    entitlement.aiTutorExtended =
      entitlement.aiTutorExtended || product.entitlements.aiTutorExtended;

    for (const language of product.entitlements.unlockedLanguages) {
      unlockedLanguages.add(language);
    }
  }

  return {
    ...entitlement,
    unlockedLanguages: [...unlockedLanguages]
  };
}
