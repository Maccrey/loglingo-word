/**
 * chatHistoryStorage.ts
 *
 * AI 채팅 대화 기록을 LocalStorage에 보관한다.
 *
 * 정책:
 *   - 키: chat_history_{userId}_{targetLanguage} (날짜 독립 — 날이 바뀌어도 유지)
 *   - 최대 저장 메시지 수: 100개 (display 전용, API 전송에는 사용 안 함)
 *   - 화면 표시용 전체 기록과 AI 전송용 압축 컨텍스트를 분리한다.
 *
 * ※ AI API로 전송할 recentMessages 는 ChatClient에서 slice(-8)로 조절한다.
 *    API 비용 절감: 최근 8개 메시지(4회 왕복)만 전송.
 *    나머지 컨텍스트는 chatLearningStorage의 학습 이력 요약이 대신한다.
 */

import type { AIChatMessage } from '@wordflow/ai/chat';

// --- 상수 ---

/** 화면 표시용 최대 보관 메시지 수 */
const MAX_STORED_MESSAGES = 100;

// --- 내부 유틸 ---

function storageKey(userId: string, targetLanguage: string): string {
  // 언어별로 분리해 다른 언어 학습 기록과 섞이지 않게 함
  return `chat_history_${userId}_${targetLanguage}`;
}

// --- 공개 API ---

/**
 * 채팅 기록을 불러온다.
 * 날짜 검증 없이 전체 기록을 반환한다 (날이 바뀌어도 유지).
 */
export function loadChatHistory(
  userId: string,
  targetLanguage: string
): AIChatMessage[] {
  if (typeof window === 'undefined' || !userId) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey(userId, targetLanguage));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as AIChatMessage[];
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

/**
 * 채팅 기록을 저장한다.
 * MAX_STORED_MESSAGES를 초과하면 오래된 메시지부터 제거한다.
 */
export function saveChatHistory(
  userId: string,
  targetLanguage: string,
  messages: AIChatMessage[]
): void {
  if (typeof window === 'undefined' || !userId) {
    return;
  }

  const trimmed = messages.slice(-MAX_STORED_MESSAGES);
  window.localStorage.setItem(
    storageKey(userId, targetLanguage),
    JSON.stringify(trimmed)
  );
}

/**
 * 채팅 기록을 초기화한다. (디버그/테스트용)
 */
export function clearChatHistory(
  userId: string,
  targetLanguage: string
): void {
  if (typeof window === 'undefined' || !userId) {
    return;
  }
  window.localStorage.removeItem(storageKey(userId, targetLanguage));
}
