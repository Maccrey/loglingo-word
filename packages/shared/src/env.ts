import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  POLAR_ACCESS_TOKEN: z.string().min(1),
  POLAR_WEBHOOK_SECRET: z.string().min(1),
  
  // Point Earning Rules
  POINTS_LEARNING_BASE: z.coerce.number().default(500),
  POINTS_WORDS: z.coerce.number().default(10),
  POINTS_REVIEW: z.coerce.number().default(200),
  POINTS_SENTENCES: z.coerce.number().default(50),
  POINTS_GPT_CONVERSATION: z.coerce.number().default(300),

  // Cat Care Costs
  CAT_COST_FEED: z.coerce.number().default(100),
  CAT_COST_WASH: z.coerce.number().default(150),
  CAT_COST_PLAY: z.coerce.number().default(200),
  CAT_COST_HEAL: z.coerce.number().default(1000),

  // Cat Status Thresholds (hours)
  CAT_HUNGRY_HOURS: z.coerce.number().default(12),
  CAT_SMELLY_HOURS: z.coerce.number().default(24),
  CAT_STRESSED_HOURS: z.coerce.number().default(24),
  CAT_STRESS_AFTER_PLAY_MISS_HOURS: z.coerce.number().default(3),
  CAT_STRESS_WARNING_LIMIT_HOURS: z.coerce.number().default(12),
  CAT_SICK_AFTER_NO_PLAY_HOURS: z.coerce.number().default(15),
  CAT_SICK_HOURS: z.coerce.number().default(48),
  CAT_CRITICAL_HOURS: z.coerce.number().default(24),
  CAT_DEAD_DAYS: z.coerce.number().default(3),

  // Cat Growth Thresholds (days)
  CAT_STAGE_JUNIOR_DAYS: z.coerce.number().default(30),
  CAT_STAGE_ADULT_DAYS: z.coerce.number().default(90),
  CAT_STAGE_MIDDLE_AGE_DAYS: z.coerce.number().default(150),
  CAT_STAGE_SENIOR_DAYS: z.coerce.number().default(210),
  CAT_STAGE_VETERAN_DAYS: z.coerce.number().default(280),
  CAT_STAGE_LEGACY_DAYS: z.coerce.number().default(365),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): AppEnv {
  return envSchema.parse(input);
}
