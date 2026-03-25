import { z } from "zod";

export const curriculumWordSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  meaning: z.string().min(1),
  example: z.string().min(1)
});

export const curriculumUnitSchema = z.object({
  id: z.string().min(1),
  level: z.number().int().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  words: z.array(curriculumWordSchema).min(1)
});

export type CurriculumWord = z.infer<typeof curriculumWordSchema>;
export type CurriculumUnit = z.infer<typeof curriculumUnitSchema>;

