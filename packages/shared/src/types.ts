import { z } from 'zod';
import {
  supportedLearningLanguages,
  supportedLearningLevels
} from './learning-preferences';

export const supportedAppLanguages = ['ko', 'en', 'ja', 'zh', 'de'] as const;

export type SupportedAppLanguage = (typeof supportedAppLanguages)[number];

export function isSupportedAppLanguage(
  language: string
): language is SupportedAppLanguage {
  return supportedAppLanguages.includes(language as SupportedAppLanguage);
}

export const userSchema = z.object({
  id: z.string().min(1),
  nativeLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  createdAt: z.string().datetime()
});

export const vocabProgressSchema = z.object({
  wordId: z.string().min(1),
  correctStreak: z.number().int().min(0),
  storageStrength: z.number().min(0),
  retrievalStrength: z.number().min(0),
  nextReviewAt: z.string().datetime().optional()
});

export const leaderboardEntrySchema = z.object({
  weekId: z.string().min(1),
  userId: z.string().min(1),
  score: z.number().int().min(0),
  rank: z.number().int().min(1)
});

export const aiRecommendationSchema = z.object({
  userId: z.string().min(1),
  weekId: z.string().min(1),
  words: z.array(z.string().min(1)).min(1)
});

export const chatMessageSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['user', 'assistant', 'correction']),
  message: z.string().min(1),
  corrected: z.string().min(1).optional(),
  feedback: z.string().min(1).optional(),
  createdAt: z.string().datetime()
});

export const userSettingsSchema = z.object({
  userId: z.string().min(1),
  appLanguage: z.enum(supportedAppLanguages),
  learningLanguage: z.enum(supportedLearningLanguages),
  learningLevel: z.enum(supportedLearningLevels),
  sessionQuestionCount: z.number().int().min(1).max(50),
  notificationsEnabled: z.boolean(),
  premiumEnabled: z.boolean(),
  updatedAt: z.string().datetime()
});

export const learningResultPostSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum([
    'learning_result',
    'study_milestone',
    'study_comeback',
    'cat_growth'
  ]),
  userDisplayName: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  body: z.string().min(1),
  earnedPoints: z.number().int().min(0),
  streak: z.number().int().min(0),
  achievedSentence: z.string().min(1).optional(),
  eventKey: z.string().min(1).optional(),
  likeCount: z.number().int().min(0),
  shareCount: z.number().int().min(0),
  likedByUser: z.boolean(),
  createdAt: z.string().datetime()
});

export const feedCommentSchema = z.object({
  id: z.string().min(1),
  postId: z.string().min(1),
  userId: z.string().min(1),
  userDisplayName: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.string().datetime()
});

export const userDashboardStatsSchema = z.object({
  userId: z.string().min(1),
  totalPoints: z.number().int().min(0),
  leaderboardScore: z.number().int().min(0),
  updatedAt: z.string().datetime()
});

export const userHomeSummarySchema = z.object({
  userId: z.string().min(1),
  currentStreak: z.number().int().min(0),
  lastLearnedOn: z.string().optional(),
  todayCompleted: z.number().int().min(0),
  studyMinutesToday: z.number().int().min(0),
  dailyGoalTarget: z.number().int().min(1),
  updatedAt: z.string().datetime()
});

export type User = z.infer<typeof userSchema>;
export type VocabProgress = z.infer<typeof vocabProgressSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type AIRecommendation = z.infer<typeof aiRecommendationSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type LearningResultPost = z.infer<typeof learningResultPostSchema>;
export type FeedComment = z.infer<typeof feedCommentSchema>;
export type UserDashboardStats = z.infer<typeof userDashboardStatsSchema>;
export type UserHomeSummary = z.infer<typeof userHomeSummarySchema>;
