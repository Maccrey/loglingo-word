/**
 * chatLearningStorage.ts
 *
 * AI 코칭 누적 학습 이력을 압축하여 LocalStorage에 영구 보관한다.
 *
 * 설계 원칙:
 *   - 날짜에 독립적으로 저장 (날이 바뀌어도 유지)
 *   - 최소 용량: 토픽 20개 + 표현 50개 + 약점 10개 (총 ~500 bytes 이내)
 *   - AI 응답에서 추출한 "_learn" JSON 블록으로 자동 갱신
 *   - 이 요약은 시스템 프롬프트에 주입해 API 재학습을 방지한다.
 *
 * 저장 키: chat_learning_{userId}_{targetLanguage}
 */

// --- 타입 ---

export type LearningProgress = {
  /** 완료한 학습 주제 (예: "카페 주문", "길 묻기") — 최대 20개 */
  coveredTopics: string[];
  /** 배운 단어/표현 (예: "食べる[taberu]", "~ました") — 최대 50개 */
  learnedItems: string[];
  /** 반복 실수 패턴 (예: "과거형 혼동") — 최대 10개 */
  weakPoints: string[];
  /** 현재 진행 중인 코칭 단계 (1-5) */
  currentStage: number;
  /** 누적 세션 수 */
  sessionCount: number;
  /** 마지막 학습 날짜 (YYYY-MM-DD) */
  lastDate: string;
};

/** AI 응답에서 파싱되는 학습 업데이트 블록 타입 */
export type LearnUpdateBlock = {
  topics?: string[];
  items?: string[];
  weakPoints?: string[];
  stage?: number;
};

// --- 상수 ---

const MAX_TOPICS = 20;
const MAX_ITEMS = 50;
const MAX_WEAK_POINTS = 10;

// --- 내부 유틸 ---

function storageKey(userId: string, targetLanguage: string): string {
  return `chat_learning_${userId}_${targetLanguage}`;
}

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- 공개 API ---

/**
 * 누적 학습 이력을 불러온다.
 * 기록이 없으면 초기 상태를 반환한다.
 */
export function loadLearningProgress(
  userId: string,
  targetLanguage: string
): LearningProgress {
  if (typeof window === 'undefined' || !userId) {
    return createEmptyProgress();
  }

  try {
    const raw = window.localStorage.getItem(storageKey(userId, targetLanguage));
    if (!raw) return createEmptyProgress();

    const parsed = JSON.parse(raw) as LearningProgress;
    if (typeof parsed !== 'object' || !Array.isArray(parsed.coveredTopics)) {
      return createEmptyProgress();
    }

    return parsed;
  } catch {
    return createEmptyProgress();
  }
}

/**
 * 누적 학습 이력을 저장한다.
 * 초과 항목은 오래된 것부터 제거해 용량을 제한한다.
 */
export function saveLearningProgress(
  userId: string,
  targetLanguage: string,
  progress: LearningProgress
): void {
  if (typeof window === 'undefined' || !userId) {
    return;
  }

  const clamped: LearningProgress = {
    ...progress,
    coveredTopics: progress.coveredTopics.slice(-MAX_TOPICS),
    learnedItems: progress.learnedItems.slice(-MAX_ITEMS),
    weakPoints: progress.weakPoints.slice(-MAX_WEAK_POINTS),
    lastDate: todayDateString()
  };

  window.localStorage.setItem(
    storageKey(userId, targetLanguage),
    JSON.stringify(clamped)
  );
}

/**
 * AI 응답의 "_learn" 블록으로 누적 이력을 갱신한다.
 * 중복 항목은 추가하지 않는다.
 */
export function applyLearnUpdate(
  progress: LearningProgress,
  update: LearnUpdateBlock
): LearningProgress {
  const addUnique = (arr: string[], items: string[] = []): string[] => {
    const set = new Set(arr);
    for (const item of items) {
      if (item.trim()) set.add(item.trim());
    }
    return Array.from(set);
  };

  return {
    ...progress,
    coveredTopics: addUnique(progress.coveredTopics, update.topics),
    learnedItems: addUnique(progress.learnedItems, update.items),
    weakPoints: addUnique(progress.weakPoints, update.weakPoints),
    currentStage: update.stage ?? progress.currentStage,
    lastDate: todayDateString()
  };
}

/**
 * AI 응답 텍스트에서 "_learn" JSON 블록을 추출해 파싱한다.
 * 블록이 없으면 null을 반환한다.
 */
export function parseLearnBlock(rawContent: string): LearnUpdateBlock | null {
  const match = rawContent.match(/\{"_learn":\s*(\{[^{}]*\})\}/s);
  if (!match || !match[1]) return null;

  try {
    return JSON.parse(match[1]) as LearnUpdateBlock;
  } catch {
    return null;
  }
}

/**
 * 학습 이력을 시스템 프롬프트용 압축 텍스트로 변환한다.
 * (약 100-200 토큰 이내로 유지)
 */
export function formatProgressForPrompt(progress: LearningProgress): string {
  const hasHistory =
    progress.coveredTopics.length > 0 ||
    progress.learnedItems.length > 0;

  if (!hasHistory) return '';

  const lines: string[] = [
    `[누적 학습 이력 — 세션 ${progress.sessionCount}회 | 현재 ${progress.currentStage}단계]`
  ];

  if (progress.coveredTopics.length > 0) {
    lines.push(`완료한 주제: ${progress.coveredTopics.join(', ')}`);
  }
  if (progress.learnedItems.length > 0) {
    lines.push(`배운 표현: ${progress.learnedItems.join(', ')}`);
  }
  if (progress.weakPoints.length > 0) {
    lines.push(`반복 약점: ${progress.weakPoints.join(', ')}`);
  }
  lines.push(`→ 위 내용은 완전히 습득된 것으로 간주하고 반복하지 말 것. 다음 단계로 진행한다.`);

  return lines.join('\n');
}

function createEmptyProgress(): LearningProgress {
  return {
    coveredTopics: [],
    learnedItems: [],
    weakPoints: [],
    currentStage: 1,
    sessionCount: 0,
    lastDate: ''
  };
}

/**
 * 초기화 (디버그/테스트용)
 */
export function clearLearningProgress(
  userId: string,
  targetLanguage: string
): void {
  if (typeof window === 'undefined' || !userId) return;
  window.localStorage.removeItem(storageKey(userId, targetLanguage));
}
