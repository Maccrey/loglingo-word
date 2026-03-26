import type { UserEntitlement } from './catalog';

export type PremiumFeature =
  | 'ad_free'
  | 'language_unlock'
  | 'ai_tutor_extended';

export function canAccessAdFree(entitlements: UserEntitlement): boolean {
  return entitlements.adFree;
}

export function canAccessLanguage(
  entitlements: UserEntitlement,
  languageCode: string
): boolean {
  return entitlements.unlockedLanguages.includes(languageCode);
}

export function canAccessAiTutorExtended(
  entitlements: UserEntitlement
): boolean {
  return entitlements.aiTutorExtended;
}

export function canAccessPremiumFeature(input: {
  entitlements: UserEntitlement;
  feature: PremiumFeature;
  languageCode?: string;
}): boolean {
  if (input.feature === 'ad_free') {
    return canAccessAdFree(input.entitlements);
  }

  if (input.feature === 'language_unlock') {
    return input.languageCode
      ? canAccessLanguage(input.entitlements, input.languageCode)
      : false;
  }

  return canAccessAiTutorExtended(input.entitlements);
}
