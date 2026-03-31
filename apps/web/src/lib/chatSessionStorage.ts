/**
 * chatSessionStorage.ts
 *
 * 하루 AI 이성친구 채팅 사용 시간을 LocalStorage로 추적한다.
 *
 * 정책 (PRD 4.9):
 *   - 구독자(premiumEnabled=true): 기본 허용 30분
 *   - 비구독자(premiumEnabled=false): 기본 허용 0분
 *   - $1 결제(chat.extend_1h) 1회당 허용 시간 +60분 (무제한 반복)
 *   - 날짜가 바뀌면 자동 리셋
 *
 * LocalStorage 키: chat_session_{YYYY-MM-DD}
 * 저장 구조: { usedSeconds: number, bonusMinutes: number }
 *   - usedSeconds: 오늘 사용한 시간(초)
 *   - bonusMinutes: 결제로 추가된 허용 시간(분)
 */

// --- 상수 ---

/** 구독자 기본 허용 시간 (분) */
const PREMIUM_BASE_MINUTES = 30;

/** 비구독자 기본 허용 시간 (분) */
const FREE_BASE_MINUTES = 0;

/** 1회 연장 시 추가되는 시간 (분) */
const EXTEND_MINUTES_PER_PURCHASE = 60;

// --- 타입 ---

type ChatDaySession = {
  usedSeconds: number;
  bonusMinutes: number;
};

// --- 내부 유틸 ---

function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `chat_session_${yyyy}-${mm}-${dd}`;
}

function readSession(): ChatDaySession {
  if (typeof window === 'undefined') {
    return { usedSeconds: 0, bonusMinutes: 0 };
  }
  try {
    const raw = localStorage.getItem(todayKey());
    if (!raw) {
      return { usedSeconds: 0, bonusMinutes: 0 };
    }
    const parsed = JSON.parse(raw) as Partial<ChatDaySession>;
    return {
      usedSeconds: typeof parsed.usedSeconds === 'number' ? parsed.usedSeconds : 0,
      bonusMinutes: typeof parsed.bonusMinutes === 'number' ? parsed.bonusMinutes : 0
    };
  } catch {
    return { usedSeconds: 0, bonusMinutes: 0 };
  }
}

function writeSession(session: ChatDaySession): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(todayKey(), JSON.stringify(session));
}

// --- 공개 API ---

/**
 * 오늘 사용한 분을 반환한다. (소수점 버림)
 */
export function getDailyUsedMinutes(): number {
  const session = readSession();
  return Math.floor(session.usedSeconds / 60);
}

/**
 * 오늘 허용된 총 사용 가능 시간(분)을 반환한다.
 * - 구독자: 기본 30분 + bonusMinutes
 * - 비구독자: 기본 0분 + bonusMinutes
 */
export function getAllowedMinutes(isPremium: boolean): number {
  const session = readSession();
  const base = isPremium ? PREMIUM_BASE_MINUTES : FREE_BASE_MINUTES;
  return base + session.bonusMinutes;
}

/**
 * 남은 사용 가능 시간(분)을 반환한다. 0이 최솟값.
 */
export function getRemainingMinutes(isPremium: boolean): number {
  const allowed = getAllowedMinutes(isPremium);
  const used = getDailyUsedMinutes();
  return Math.max(0, allowed - used);
}

/**
 * 오늘 허용된 시간을 모두 소진했는지 여부를 반환한다.
 */
export function isSessionExpired(isPremium: boolean): boolean {
  return getRemainingMinutes(isPremium) <= 0;
}

/**
 * 사용 시간(초)을 누적한다.
 * - 30초 또는 1분 단위로 호출하는 것을 권장한다.
 */
export function addUsedSeconds(deltaSeconds: number): void {
  const session = readSession();
  writeSession({
    ...session,
    usedSeconds: session.usedSeconds + deltaSeconds
  });
}

/**
 * $1 결제(chat.extend_1h) 완료 후 허용 시간 60분 추가.
 * 무제한 반복 가능.
 */
export function addBonusTime(): void {
  const session = readSession();
  writeSession({
    ...session,
    bonusMinutes: session.bonusMinutes + EXTEND_MINUTES_PER_PURCHASE
  });
}

/**
 * 디버그용: 오늘 세션 데이터를 초기화한다.
 */
export function __resetTodaySession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(todayKey());
}
