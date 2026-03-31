export type PaymentProductId =
  | 'premium.monthly'
  | 'language_pack.plus'
  | 'ai_tutor.pro'
  // 채팅 1시간 연장: 구독자/비구독자 모두 $1로 1시간씩 추가 가능 (무제한 반복)
  | 'chat.extend_1h';

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
  },
  {
    // 채팅 1시간 연장 상품: 구독 여부에 관계없이 $1로 1시간 추가 사용 가능
    // 비구독자: 기본 0분 → 결제 후 60분
    // 구독자: 기본 30분 소진 후 → 결제 후 +60분
    // 연장 횟수 무제한
    id: 'chat.extend_1h',
    name: 'AI 채팅 1시간 연장',
    description: 'AI 이성친구와 1시간 더 대화할 수 있습니다.',
    priceLabel: '$1.00',
    entitlements: {
      adFree: false,
      unlockedLanguages: [],
      aiTutorExtended: false
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
