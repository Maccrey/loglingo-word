import { describe, expect, it } from "vitest";

import {
  getNextOnboardingStep,
  markFirstLessonStarted,
  updateGoal,
  updateLanguages
} from "../../services/core/src/onboarding";

describe("onboarding", () => {
  it("stays on language step until a valid language pair is chosen", () => {
    expect(getNextOnboardingStep({})).toBe("language");
    expect(
      getNextOnboardingStep({
        nativeLanguage: "ko",
        targetLanguage: "ko"
      })
    ).toBe("language");
  });

  it("moves through goal and start steps in order", () => {
    const withLanguage = updateLanguages({}, "ko", "en");
    const withGoal = updateGoal(withLanguage, "conversation");
    const completed = markFirstLessonStarted(
      withGoal,
      "2026-03-25T00:00:00.000Z"
    );

    expect(getNextOnboardingStep(withLanguage)).toBe("goal");
    expect(getNextOnboardingStep(withGoal)).toBe("start");
    expect(getNextOnboardingStep(completed)).toBe("complete");
  });

  it("throws when goal is selected before language completion", () => {
    expect(() => updateGoal({}, "travel")).toThrow(
      "Language step must be completed first."
    );
  });
});
