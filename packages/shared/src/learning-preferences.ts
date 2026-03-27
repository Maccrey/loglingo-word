export const supportedLearningLanguages = ['en', 'ja'] as const;

export type SupportedLearningLanguage =
  (typeof supportedLearningLanguages)[number];

export const supportedLearningLevels = [
  'cefr_a1',
  'cefr_a2',
  'cefr_b1',
  'cefr_b2',
  'cefr_c1',
  'cefr_c2',
  'jlpt_n5',
  'jlpt_n4',
  'jlpt_n3',
  'jlpt_n2',
  'jlpt_n1'
] as const;

export type SupportedLearningLevel =
  (typeof supportedLearningLevels)[number];

export const learningLevelOptionsByLanguage: Record<
  SupportedLearningLanguage,
  Array<{ value: SupportedLearningLevel; label: string }>
> = {
  en: [
    { value: 'cefr_a1', label: 'CEFR A1' },
    { value: 'cefr_a2', label: 'CEFR A2' },
    { value: 'cefr_b1', label: 'CEFR B1' },
    { value: 'cefr_b2', label: 'CEFR B2' },
    { value: 'cefr_c1', label: 'CEFR C1' },
    { value: 'cefr_c2', label: 'CEFR C2' }
  ],
  ja: [
    { value: 'jlpt_n5', label: 'JLPT N5' },
    { value: 'jlpt_n4', label: 'JLPT N4' },
    { value: 'jlpt_n3', label: 'JLPT N3' },
    { value: 'jlpt_n2', label: 'JLPT N2' },
    { value: 'jlpt_n1', label: 'JLPT N1' }
  ]
};

export function getDefaultLearningLevel(
  language: SupportedLearningLanguage
): SupportedLearningLevel {
  return language === 'ja' ? 'jlpt_n5' : 'cefr_a1';
}

export function isLearningLevelSupportedForLanguage(
  language: SupportedLearningLanguage,
  level: string
): level is SupportedLearningLevel {
  return learningLevelOptionsByLanguage[language].some(
    (option) => option.value === level
  );
}

export function getNextLearningLevel(
  language: SupportedLearningLanguage,
  currentLevel: SupportedLearningLevel
): SupportedLearningLevel | null {
  if (!isLearningLevelSupportedForLanguage(language, currentLevel)) {
    return null;
  }

  const currentIndex = learningLevelOptionsByLanguage[language].findIndex(
    (option) => option.value === currentLevel
  );

  if (currentIndex === -1) {
    return null;
  }

  return (
    learningLevelOptionsByLanguage[language][currentIndex + 1]?.value ?? null
  );
}

export function getLearningLevelLabel(
  language: SupportedLearningLanguage,
  level: SupportedLearningLevel
): string {
  const matched = learningLevelOptionsByLanguage[language].find(
    (option) => option.value === level
  );

  return matched?.label ?? level;
}
