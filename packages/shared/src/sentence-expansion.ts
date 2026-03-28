import { z } from 'zod';
import jlptN5SentenceAssemblySeed from './data/jlpt-n5-sentence-expansion.json';
import {
  supportedLearningLanguages,
  supportedLearningLevels
} from './learning-preferences';

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

export const jlptN5SentenceAssemblyExercises: SentenceAssemblyExercise[] =
  jlptN5SentenceAssemblySeed.map((exercise) =>
    sentenceAssemblyExerciseSchema.parse(exercise)
  );
