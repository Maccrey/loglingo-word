import { z } from 'zod';
import {
  supportedLearningLanguages,
  supportedLearningLevels
} from './learning-preferences';

export const curriculumWordSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  reading: z.string().min(1).optional(),
  meaning: z.string().min(1),
  example: z.string().min(1),
  partOfSpeech: z.string().min(1).optional(),
  quiz: z
    .object({
      distractors: z.array(z.string().min(1)).min(1)
    })
    .optional(),
  writing: z
    .object({
      prompt: z.string().min(1),
      answer: z.string().min(1),
      accepted: z.array(z.string().min(1)).min(1).optional(),
      script: z.enum(['kana', 'kanji', 'mixed']).optional()
    })
    .optional()
});

export const curriculumUnitSchema = z.object({
  id: z.string().min(1),
  language: z.enum(supportedLearningLanguages),
  standardLevel: z.enum(supportedLearningLevels),
  level: z.number().int().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  words: z.array(curriculumWordSchema).min(1)
});

export type CurriculumWord = z.infer<typeof curriculumWordSchema>;
export type CurriculumUnit = z.infer<typeof curriculumUnitSchema>;
