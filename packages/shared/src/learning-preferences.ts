export const supportedLearningLanguages = ['ko', 'en', 'ja', 'zh', 'de'] as const;

export type SupportedLearningLanguage =
  (typeof supportedLearningLanguages)[number];

const cefrLevelOptions = [
  { value: 'cefr_a1', label: 'CEFR A1' },
  { value: 'cefr_a2', label: 'CEFR A2' },
  { value: 'cefr_b1', label: 'CEFR B1' },
  { value: 'cefr_b2', label: 'CEFR B2' },
  { value: 'cefr_c1', label: 'CEFR C1' },
  { value: 'cefr_c2', label: 'CEFR C2' }
] as const;

const topikLevelOptions = [
  { value: 'topik_1', label: 'TOPIK 1' },
  { value: 'topik_2', label: 'TOPIK 2' },
  { value: 'topik_3', label: 'TOPIK 3' },
  { value: 'topik_4', label: 'TOPIK 4' },
  { value: 'topik_5', label: 'TOPIK 5' },
  { value: 'topik_6', label: 'TOPIK 6' }
] as const;

const hskLevelOptions = [
  { value: 'hsk_1', label: 'HSK 1' },
  { value: 'hsk_2', label: 'HSK 2' },
  { value: 'hsk_3', label: 'HSK 3' },
  { value: 'hsk_4', label: 'HSK 4' },
  { value: 'hsk_5', label: 'HSK 5' },
  { value: 'hsk_6', label: 'HSK 6' }
] as const;

export function isSupportedLearningLanguage(
  language: string
): language is SupportedLearningLanguage {
  return supportedLearningLanguages.includes(
    language as SupportedLearningLanguage
  );
}

export const supportedLearningLevels = [
  'cefr_a1',
  'cefr_a2',
  'cefr_b1',
  'cefr_b2',
  'cefr_c1',
  'cefr_c2',
  'topik_1',
  'topik_2',
  'topik_3',
  'topik_4',
  'topik_5',
  'topik_6',
  'hsk_1',
  'hsk_2',
  'hsk_3',
  'hsk_4',
  'hsk_5',
  'hsk_6',
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
  ko: [...topikLevelOptions],
  en: [...cefrLevelOptions],
  ja: [
    { value: 'jlpt_n5', label: 'JLPT N5' },
    { value: 'jlpt_n4', label: 'JLPT N4' },
    { value: 'jlpt_n3', label: 'JLPT N3' },
    { value: 'jlpt_n2', label: 'JLPT N2' },
    { value: 'jlpt_n1', label: 'JLPT N1' }
  ],
  zh: [...hskLevelOptions],
  de: [...cefrLevelOptions]
};

export function getDefaultLearningLevel(
  language: SupportedLearningLanguage
): SupportedLearningLevel {
  switch (language) {
    case 'ja':
      return 'jlpt_n5';
    case 'ko':
      return 'topik_1';
    case 'zh':
      return 'hsk_1';
    default:
      return 'cefr_a1';
  }
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
