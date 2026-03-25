import { describe, expect, it } from "vitest";

import {
  aiRecommendationSchema,
  chatMessageSchema,
  leaderboardEntrySchema,
  userSchema,
  vocabProgressSchema
} from "../../packages/shared/src/types";

describe("domain schemas", () => {
  it("accepts valid domain payloads", () => {
    expect(
      userSchema.parse({
        id: "user-1",
        nativeLanguage: "ko",
        targetLanguage: "en",
        createdAt: "2026-03-25T00:00:00.000Z"
      }).id
    ).toBe("user-1");

    expect(
      vocabProgressSchema.parse({
        wordId: "hello",
        correctStreak: 3,
        storageStrength: 1.2,
        retrievalStrength: 0.8,
        nextReviewAt: "2026-03-26T00:00:00.000Z"
      }).wordId
    ).toBe("hello");

    expect(
      leaderboardEntrySchema.parse({
        weekId: "2026-W13",
        userId: "user-1",
        score: 100,
        rank: 1
      }).score
    ).toBe(100);

    expect(
      aiRecommendationSchema.parse({
        userId: "user-1",
        weekId: "2026-W13",
        words: ["hello", "world"]
      }).words
    ).toHaveLength(2);

    expect(
      chatMessageSchema.parse({
        userId: "user-1",
        message: "hello",
        corrected: "Hello.",
        feedback: "첫 글자를 대문자로 쓰세요.",
        createdAt: "2026-03-25T00:00:00.000Z"
      }).message
    ).toBe("hello");
  });

  it("rejects invalid domain payloads", () => {
    expect(() =>
      userSchema.parse({
        id: "",
        nativeLanguage: "ko",
        targetLanguage: "en",
        createdAt: "invalid-date"
      })
    ).toThrow();

    expect(() =>
      vocabProgressSchema.parse({
        wordId: "hello",
        correctStreak: -1,
        storageStrength: 1,
        retrievalStrength: 1
      })
    ).toThrow();
  });
});

