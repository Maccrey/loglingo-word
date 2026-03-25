"use client";

import { useState } from "react";

import {
  supportedLanguages,
  type SupportedLanguage
} from "@wordflow/shared/languages";
import {
  getNextOnboardingStep,
  markFirstLessonStarted,
  type LearningGoal,
  type OnboardingState,
  updateGoal,
  updateLanguages
} from "@wordflow/core/onboarding";

const goals: Array<{ value: LearningGoal; label: string }> = [
  { value: "daily_habit", label: "매일 꾸준히 학습" },
  { value: "travel", label: "여행 회화" },
  { value: "business", label: "업무 영어" },
  { value: "conversation", label: "자연스러운 대화" }
];

function LanguageSelect(props: {
  id: string;
  label: string;
  value: string | undefined;
  options: SupportedLanguage[];
  onChange: (value: string) => void;
}) {
  const { id, label, value, options, onChange } = props;

  return (
    <label htmlFor={id} style={{ display: "grid", gap: 8 }}>
      <span>{label}</span>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">선택하세요</option>
        {options.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeLabel} ({language.englishLabel})
          </option>
        ))}
      </select>
    </label>
  );
}

export default function OnboardingClient() {
  const [state, setState] = useState<OnboardingState>({});
  const [error, setError] = useState<string>("");
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success">(
    "idle"
  );

  const currentStep = getNextOnboardingStep(state);
  const canSave = currentStep === "complete";

  async function handleSaveProfile() {
    if (!state.nativeLanguage || !state.targetLanguage || !state.goal || !state.startedAt) {
      setError("온보딩을 모두 완료한 뒤 저장할 수 있습니다.");
      return;
    }

    try {
      setError("");
      setSaveState("loading");

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: "demo-user",
          nativeLanguage: state.nativeLanguage,
          targetLanguage: state.targetLanguage,
          goal: state.goal,
          startedAt: state.startedAt
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "프로필 저장에 실패했습니다.");
      }

      setSaveState("success");
    } catch (caughtError) {
      setSaveState("idle");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "프로필 저장에 실패했습니다."
      );
    }
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>온보딩</h1>
      <p>현재 단계: {currentStep}</p>

      <section style={{ display: "grid", gap: 12 }}>
        <LanguageSelect
          id="nativeLanguage"
          label="모국어"
          value={state.nativeLanguage}
          options={supportedLanguages}
          onChange={(nativeLanguage) => {
            try {
              setError("");
              setState((currentState) =>
                updateLanguages(
                  currentState,
                  nativeLanguage,
                  currentState.targetLanguage ?? ""
                )
              );
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "언어를 선택할 수 없습니다."
              );
            }
          }}
        />

        <LanguageSelect
          id="targetLanguage"
          label="학습 언어"
          value={state.targetLanguage}
          options={supportedLanguages}
          onChange={(targetLanguage) => {
            try {
              setError("");
              setState((currentState) =>
                updateLanguages(
                  currentState,
                  currentState.nativeLanguage ?? "",
                  targetLanguage
                )
              );
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "언어를 선택할 수 없습니다."
              );
            }
          }}
        />
      </section>

      <section style={{ display: "grid", gap: 8 }}>
        <p>학습 목표</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {goals.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => {
                try {
                  setError("");
                  setState((currentState) => updateGoal(currentState, goal.value));
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error
                      ? caughtError.message
                      : "목표를 선택할 수 없습니다."
                  );
                }
              }}
            >
              {goal.label}
            </button>
          ))}
        </div>
        <p>선택된 목표: {state.goal ?? "없음"}</p>
      </section>

      <section style={{ display: "grid", gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            try {
              setError("");
              setState((currentState) =>
                markFirstLessonStarted(currentState, new Date().toISOString())
              );
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "첫 학습을 시작할 수 없습니다."
              );
            }
          }}
        >
          첫 학습 시작
        </button>
        <p>시작 여부: {state.startedAt ? "완료" : "대기"}</p>
      </section>

      <section style={{ display: "grid", gap: 8 }}>
        <button type="button" disabled={!canSave || saveState === "loading"} onClick={handleSaveProfile}>
          {saveState === "loading" ? "저장 중..." : "온보딩 저장"}
        </button>
        <p>저장 상태: {saveState === "success" ? "성공" : "대기"}</p>
      </section>

      {error ? (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      ) : null}
    </main>
  );
}
