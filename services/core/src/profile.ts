import { z } from "zod";

import { userSchema, type User } from "@wordflow/shared/types";

import { type LearningGoal } from "./onboarding";

export const onboardingProfileInputSchema = z.object({
  id: z.string().min(1),
  nativeLanguage: z.string().min(2),
  targetLanguage: z.string().min(2),
  goal: z.enum(["daily_habit", "travel", "business", "conversation"]),
  startedAt: z.string().datetime()
});

export type OnboardingProfileInput = z.infer<typeof onboardingProfileInputSchema>;

export type UserProfileRecord = User & {
  goal: LearningGoal;
  updatedAt: string;
};

export type UserDocument = {
  collection: "users";
  id: string;
  data: UserProfileRecord;
};

export type UserProfileRepository = {
  findById(id: string): Promise<UserProfileRecord | null>;
  save(profile: UserProfileRecord): Promise<UserProfileRecord>;
};

export function toUserRecord(input: OnboardingProfileInput): UserProfileRecord {
  const createdAt = input.startedAt;

  userSchema.parse({
    id: input.id,
    nativeLanguage: input.nativeLanguage,
    targetLanguage: input.targetLanguage,
    createdAt
  });

  return {
    id: input.id,
    nativeLanguage: input.nativeLanguage,
    targetLanguage: input.targetLanguage,
    goal: input.goal,
    createdAt,
    updatedAt: input.startedAt
  };
}

export function toUserDocument(profile: UserProfileRecord): UserDocument {
  return {
    collection: "users",
    id: profile.id,
    data: profile
  };
}

export async function saveOnboardingProfile(
  input: OnboardingProfileInput,
  repository: UserProfileRepository
): Promise<{ profile: UserProfileRecord; operation: "created" | "updated" }> {
  const validatedInput = onboardingProfileInputSchema.parse(input);
  const existingProfile = await repository.findById(validatedInput.id);

  const profile = existingProfile
    ? {
        ...existingProfile,
        nativeLanguage: validatedInput.nativeLanguage,
        targetLanguage: validatedInput.targetLanguage,
        goal: validatedInput.goal,
        updatedAt: validatedInput.startedAt
      }
    : toUserRecord(validatedInput);

  const savedProfile = await repository.save(profile);

  return {
    profile: savedProfile,
    operation: existingProfile ? "updated" : "created"
  };
}

export class InMemoryUserProfileRepository implements UserProfileRepository {
  private readonly store = new Map<string, UserProfileRecord>();

  async findById(id: string): Promise<UserProfileRecord | null> {
    return this.store.get(id) ?? null;
  }

  async save(profile: UserProfileRecord): Promise<UserProfileRecord> {
    this.store.set(profile.id, profile);
    return profile;
  }
}

