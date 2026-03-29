import { z } from 'zod';
import cefrA1SentenceAssemblySeed from './data/en/cefr-a1-sentence-expansion.json';
import jlptN5SentenceAssemblySeed from './data/ja/jlpt-n5-sentence-expansion.json';
import topik1SentenceAssemblySeed from './data/ko/topik-1-sentence-expansion.json';
import hsk1SentenceAssemblySeed from './data/zh/hsk-1-sentence-expansion.json';
import {
  getDefaultLearningLevel,
  supportedLearningLanguages,
  supportedLearningLevels,
  type SupportedLearningLanguage,
  type SupportedLearningLevel
} from './learning-preferences';
import { supportedAppLanguages } from './types';

export const sentenceAssemblyBlockSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1)
});

export const sentenceAssemblyDistractorSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  advice: z.string().min(1)
});

export const sentenceAssemblyStageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  goal: z.string().min(1),
  goalSegments: z.array(z.string().min(1)).min(1),
  goalTranslations: z.record(
    z.enum(supportedAppLanguages),
    z.object({
      text: z.string().min(1),
      segments: z.array(z.string().min(1)).min(1),
      segmentBlockIndexes: z.array(z.number().int().min(0)).min(1)
    })
  ),
  focus: z.string().min(1),
  selectionAdvice: z.string().min(1),
  completionAdvice: z.string().min(1),
  correctBlocks: z.array(sentenceAssemblyBlockSchema).min(2),
  distractorBlocks: z.array(sentenceAssemblyDistractorSchema).min(1)
});

export const sentenceAssemblyExerciseSchema = z.object({
  id: z.string().min(1),
  language: z.enum(supportedLearningLanguages),
  level: z.enum(supportedLearningLevels),
  title: z.string().min(1),
  description: z.string().min(1),
  stages: z.array(sentenceAssemblyStageSchema).min(1)
});

export type SentenceAssemblyBlock = z.infer<typeof sentenceAssemblyBlockSchema>;
export type SentenceAssemblyDistractor = z.infer<
  typeof sentenceAssemblyDistractorSchema
>;
export type SentenceAssemblyStage = z.infer<typeof sentenceAssemblyStageSchema>;
export type SentenceAssemblyExercise = z.infer<
  typeof sentenceAssemblyExerciseSchema
>;

const sentenceAssemblySeedEntries = [
  {
    language: 'en',
    level: 'cefr_a1',
    seed: cefrA1SentenceAssemblySeed
  },
  {
    language: 'ja',
    level: 'jlpt_n5',
    seed: jlptN5SentenceAssemblySeed
  },
  {
    language: 'ko',
    level: 'topik_1',
    seed: topik1SentenceAssemblySeed
  },
  {
    language: 'zh',
    level: 'hsk_1',
    seed: hsk1SentenceAssemblySeed
  }
] as const;

function parseSentenceAssemblySeed(
  language: SupportedLearningLanguage,
  level: SupportedLearningLevel,
  seed: unknown[]
): SentenceAssemblyExercise[] {
  return seed.map((exercise) => {
    const parsed = sentenceAssemblyExerciseSchema.parse(exercise);

    if (parsed.language !== language || parsed.level !== level) {
      throw new Error(
        `Sentence assembly seed mismatch: expected ${language}/${level}, got ${parsed.language}/${parsed.level}`
      );
    }

    return parsed;
  });
}

export const sentenceAssemblyExercisesByLanguageLevel = new Map<
  `${SupportedLearningLanguage}:${SupportedLearningLevel}`,
  SentenceAssemblyExercise[]
>(
  sentenceAssemblySeedEntries.map((entry) => [
    `${entry.language}:${entry.level}`,
    parseSentenceAssemblySeed(entry.language, entry.level, entry.seed)
  ])
);

export const sentenceAssemblyExercises: SentenceAssemblyExercise[] = [
  ...sentenceAssemblyExercisesByLanguageLevel.values()
].flat();

export const cefrA1SentenceAssemblyExercises: SentenceAssemblyExercise[] =
  sentenceAssemblyExercisesByLanguageLevel.get('en:cefr_a1') ?? [];

export const jlptN5SentenceAssemblyExercises: SentenceAssemblyExercise[] =
  sentenceAssemblyExercisesByLanguageLevel.get('ja:jlpt_n5') ?? [];

export const topik1SentenceAssemblyExercises: SentenceAssemblyExercise[] =
  sentenceAssemblyExercisesByLanguageLevel.get('ko:topik_1') ?? [];

export const hsk1SentenceAssemblyExercises: SentenceAssemblyExercise[] =
  sentenceAssemblyExercisesByLanguageLevel.get('zh:hsk_1') ?? [];

export function getSentenceAssemblyExercisePool(input?: {
  language?: SupportedLearningLanguage;
  level?: SupportedLearningLevel;
}): SentenceAssemblyExercise[] {
  const language = input?.language;
  const level = input?.level;

  if (language && level) {
    return [
      ...(sentenceAssemblyExercisesByLanguageLevel.get(`${language}:${level}`) ??
        [])
    ];
  }

  if (language) {
    return sentenceAssemblyExercises.filter(
      (exercise) => exercise.language === language
    );
  }

  return [...sentenceAssemblyExercises];
}

export function getSentenceAssemblyExerciseFallbackLevel(
  language: SupportedLearningLanguage
): SupportedLearningLevel {
  return getDefaultLearningLevel(language);
}
