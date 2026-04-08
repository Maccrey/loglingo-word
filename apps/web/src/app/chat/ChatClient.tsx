'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CollapsiblePageHeader } from '../../components/CollapsiblePageHeader';

import type { AIChatMessage } from '@wordflow/ai/chat';

import StatusMessage from '../components/StatusMessage';
import { resolveAppErrorMessage } from '../errors';
import { t, type AppLocale } from '../i18n';
import { useAppAuth } from '../../lib/useAppAuth';
import { AuthRequiredModal } from '../../components/AuthRequiredModal';
import { TermsConsentModal } from '../../components/TermsConsentModal';
import { SubscriptionRequiredModal } from '../../components/SubscriptionRequiredModal';
import { isSubscriptionActive } from '@wordflow/shared/types';
import { ChatTimeLimitModal } from '../../components/ChatTimeLimitModal';
import {
  addBonusTime,
  addUsedSeconds,
  getAllowedMinutes,
  getDailyUsedMinutes,
  getRemainingMinutes,
  getRemainingSeconds,
  isSessionExpired
} from '../../lib/chatSessionStorage';
import { readStoredSettingsSnapshot } from '../../lib/settingsStorage';
import { readStoredLearningProgressSnapshot } from '../../lib/learningProgressStorage';
import {
  getAiFriendGender,
  getAiFriendName
} from '@wordflow/ai/prompt';
import {
  loadChatHistory,
  saveChatHistory
} from '../../lib/chatHistoryStorage';
import {
  loadLearningProgress,
  saveLearningProgress,
  applyLearnUpdate,
  parseLearnBlock,
  formatProgressForPrompt,
  type LearningProgress
} from '../../lib/chatLearningStorage';

// --- 스타일 상수 ---

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'transparent',
  color: 'var(--text-ink)'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 32
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 16,
  padding: 32,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-pencil)',
  boxShadow: 'var(--shadow-card)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '6px 12px',
  background: 'var(--accent-yellow)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
};

const panelBadgeStyle: Record<string, string | number> = {
  ...badgeStyle,
  height: 32,
  alignItems: 'center'
};

// --- 타입 ---

type ChatClientProps = {
  locale?: AppLocale;
};

// --- 유틸 ---

function labelForRole(
  locale: AppLocale,
  role: AIChatMessage['role'],
  userDisplayName?: string | null,
  aiFriendName?: string
): string {
  if (role === 'assistant') {
    return aiFriendName ?? t(locale, 'chat.role.assistant');
  }

  if (role === 'correction') {
    return t(locale, 'chat.role.correction');
  }

  return userDisplayName?.trim() || t(locale, 'chat.role.user');
}

/** 남은 초를 MM:SS 형식으로 반환 */
function formatTimeMMSS(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 5분(300초) 이하이면 빨간색, 그 외 초록색 */
function timerColor(remainingSeconds: number): string {
  if (remainingSeconds <= 300) return '#ef4444';
  return '#22c55e';
}

// --- 컴포넌트 ---

export default function ChatClient(props: ChatClientProps) {
  const locale = props.locale ?? 'ko';
  const auth = useAppAuth();

  // ── SSR-safe 설정 로드 ────────────────────────────────────────────
  // localStorage는 클라이언트에서만 접근 가능하므로 useEffect에서 읽는다.
  // 서버/클라이언트 렌더링 불일치(hydration mismatch)를 방지하기 위해
  // 마운트 전에는 안전한 기본값으로 렌더링한다.
  const [isPremium, setIsPremium] = useState(false);
  const [userGender, setUserGender] = useState<'male' | 'female'>('female');
  const [targetLang, setTargetLang] = useState<string>('en');
  const [nativeLang, setNativeLang] = useState<string>(locale);
  const [userLevel, setUserLevel] = useState<string>('beginner');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      const settings = readStoredSettingsSnapshot();
      setIsPremium(isSubscriptionActive(settings));
      setUserGender(settings.gender ?? 'female');
      setTargetLang(settings.learningLanguage ?? 'en');
      setNativeLang(settings.appLanguage ?? locale);
      setUserLevel(settings.learningLevel ?? 'beginner');
    };

    handleSettingsUpdated();
    setIsMounted(true);

    window.addEventListener('user-settings-updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('user-settings-updated', handleSettingsUpdated);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // AI 친구 정보 (설정 로드 후 결정)
  const aiFriendGender = getAiFriendGender(userGender);
  const aiFriendName = getAiFriendName(targetLang, aiFriendGender);
  const aiFriendEmoji = aiFriendGender === 'male' ? '🧑' : '👩';
  const langFlagMap: Record<string, string> = {
    en: '🇺🇸', ja: '🇯🇵', ko: '🇰🇷', zh: '🇨🇳', de: '🇩🇪'
  };
  const langFlag = langFlagMap[targetLang] ?? '🌍';

  // 대화 상태
  // 초기값은 빈 배열 — 마운트 후 userId가 확정되면 localStorage에서 복원한다.
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  /** AI로 전송할 최근 메시지 최대 개수 — 8개(4회 왕복)로 제한해 토큰 비용 절감 */
  const RECENT_MESSAGES_LIMIT = 8;

  // 누적 학습 이력 (날짜 없이 영구 보관)
  const [learningProgress, setLearningProgress] = useState<LearningProgress>({
    coveredTopics: [],
    learnedItems: [],
    weakPoints: [],
    currentStage: 1,
    sessionCount: 0,
    lastDate: ''
  });

  // 모달 상태
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);

  // 타이머 상태 — 초 단위, SSR에서는 0으로 시작 (마운트 후 실제값으로 업데이트)
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [usedMinutes, setUsedMinutes] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- userId/targetLang 확정 후 채팅 기록 및 학습 이력 복원 ---
  useEffect(() => {
    if (!auth.userId || !targetLang) return;

    // 채팅 표시 기록 복원 (언어별 격리)
    const history = loadChatHistory(auth.userId, targetLang);
    if (history.length > 0) {
      setMessages(history);
    }

    // 누적 학습 이력 복원
    const progress = loadLearningProgress(auth.userId, targetLang);
    setLearningProgress(progress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.userId, targetLang]);

  // --- 최초 진입 시 접근 제어 ---
  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) {
      return;
    }

    if (!isPremium) {
      // 비구독자: 구독 유도 모달 (단, $1 결제로 allowedMinutes가 이미 있으면 허용)
      const allowed = getAllowedMinutes(false);
      if (allowed <= 0) {
        setShowSubscriptionModal(true);
        return;
      }
    } else {
      setShowSubscriptionModal(false);
    }

    // 이미 시간 소진된 경우
    if (isSessionExpired(isPremium)) {
      setShowTimeLimitModal(true);
    } else {
      setShowTimeLimitModal(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.isGuest, isPremium]);

  // --- 1초 카운트다운 및 실시간 로컬스토리지 기록 ---
  useEffect(() => {
    if (!auth.isAuthenticated || auth.isGuest) {
      return;
    }

    // 초기 잔여 시간을 정확히 계산 (초 단위)
    const initialRemaining = getRemainingSeconds(isPremium);
    setRemainingSeconds(initialRemaining);

    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        
        // 매 초마다 1초씩 사용 시간 증가 기록
        addUsedSeconds(1);

        if (next <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setShowTimeLimitModal(true);
        }
        return Math.max(0, next);
      });
      // UI용 분 업데이트 (필요시)
      setUsedMinutes(getDailyUsedMinutes());

      // Firestore 동기화 (useAppAuth 내부 30초 디바운스로 폭주 방지)
      void auth.saveLearningState({
        settings: readStoredSettingsSnapshot(),
        progress: readStoredLearningProgressSnapshot()
      });
    }, 1_000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      void auth.flushSaveLearningState();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.isGuest, isPremium]);

  // 연장 성공 후 카운트다운 재시작 헬퍼
  function restartCountdown(isPrem: boolean) {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const newRemaining = getRemainingSeconds(isPrem);
    setRemainingSeconds(newRemaining);
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;

        addUsedSeconds(1);

        if (next <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setShowTimeLimitModal(true);
        }
        return Math.max(0, next);
      });
      setUsedMinutes(getDailyUsedMinutes());

      void auth.saveLearningState({
        settings: readStoredSettingsSnapshot(),
        progress: readStoredLearningProgressSnapshot()
      });
    }, 1_000);
  }

  // --- 스크롤 ---
  const latestCorrection =
    [...messages].reverse().find((message) => message.role === 'correction') ??
    null;
  const conversationMessages = messages.filter(
    (message) => message.role !== 'correction'
  );

  // "원어민이라면 이렇게 말해요" 섹션 분리
  // feedback 앞부분: corrected / 뒷부분: 원어민 팁
  function extractNativeTip(feedback: string | undefined): { corrected: string; nativeTip: string } {
    if (!feedback) {
      return { corrected: '', nativeTip: '' };
    }
    const tipMarker = '원어민이라면';
    const idx = feedback.indexOf(tipMarker);
    if (idx !== -1) {
      return {
        corrected: feedback.slice(0, idx).trim(),
        nativeTip: feedback.slice(idx).trim()
      };
    }
    return { corrected: '', nativeTip: feedback };
  }

  useEffect(() => {
    const container = conversationScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }, [conversationMessages, loading]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  function handleConversationScroll() {
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      const container = conversationScrollRef.current;

      if (!container) {
        return;
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      scrollTimeoutRef.current = null;
    }, 1000);
  }

  // --- 메시지 전송 ---
  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.trim() || loading) {
      return;
    }

    // 시간 제한 체크
    if (isSessionExpired(isPremium)) {
      setShowTimeLimitModal(true);
      return;
    }

    // 비구독자 권한 체크
    if (!isPremium && getAllowedMinutes(false) <= 0) {
      setShowSubscriptionModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: auth.userId,
          nativeLanguage: nativeLang,
          targetLanguage: targetLang,
          userLevel,
          // 유저 성별 전달 → API에서 AI 친구 페르소나 결정
          userGender,
          message: draft,
          createdAt: new Date().toISOString(),
          // 최근 RECENT_MESSAGES_LIMIT 개만 AI에 전송 (토큰 비용 절감: 8개 = 4회 왕복)
          recentMessages: messages.slice(-RECENT_MESSAGES_LIMIT),
          // 누적 학습 이력 요약을 프롬프트에 주입 (재학습 방지)
          learningProgressSummary: formatProgressForPrompt(learningProgress) || undefined
        })
      });
      const payload = (await response.json()) as
        | { messages: AIChatMessage[] }
        | { message?: string };

      if (!response.ok || !('messages' in payload)) {
        throw new Error(
          'message' in payload && payload.message
            ? payload.message
            : t(locale, 'chat.error')
        );
      }

      // API 응답에서 _learn 블록이 있으면 학습 이력 갱신
      const responseBody = payload as { messages: AIChatMessage[]; learnRaw?: string | null };
      if (auth.userId && responseBody.learnRaw) {
        const learnUpdate = parseLearnBlock(responseBody.learnRaw);
        if (learnUpdate) {
          setLearningProgress((prev) => {
            const updated = applyLearnUpdate(
              { ...prev, sessionCount: prev.sessionCount + 1 },
              learnUpdate
            );
            saveLearningProgress(auth.userId!, targetLang, updated);
            return updated;
          });
        }
      }

      setMessages((current) => {
        const updated = [...current, ...payload.messages];
        // localStorage에 실시간 저장 — 페이지 이탈 후 복원용
        if (auth.userId) {
          saveChatHistory(auth.userId, targetLang, updated);
        }
        return updated;
      });
      setDraft('');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? resolveAppErrorMessage(requestError)
          : t(locale, 'chat.error')
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!draft.trim() || loading) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  }

  // 연장 결제 성공 처리
  function handleExtendSuccess() {
    addBonusTime();
    setUsedMinutes(getDailyUsedMinutes());
    setShowTimeLimitModal(false);
    setShowSubscriptionModal(false);
    // 카운트다운 재시작 (60분 연장 후 남은 시간으로)
    restartCountdown(isPremium);
  }

  const isExpired = remainingSeconds <= 0;
  const feedbackParts = extractNativeTip(latestCorrection?.feedback);

  return (
    <main style={surfaceStyle}>
      {/* 인증 모달 */}
      {auth.isGuest ? (
        <AuthRequiredModal locale={locale} onLogin={() => void auth.signIn()} />
      ) : null}
      {auth.isAuthenticated && auth.needsTermsConsent ? (
        <TermsConsentModal locale={locale} onAccept={() => void auth.acceptTerms()} />
      ) : null}

      {/* 구독 유도 모달 */}
      {showSubscriptionModal ? (
        <SubscriptionRequiredModal onPurchaseSuccess={handleExtendSuccess} />
      ) : null}

      {/* 시간 제한 모달 */}
      {showTimeLimitModal ? (
        <ChatTimeLimitModal
          usedMinutes={usedMinutes}
          onExtendSuccess={handleExtendSuccess}
        />
      ) : null}

      <div style={shellStyle}>
        <CollapsiblePageHeader locale={locale}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={badgeStyle}>{t(locale, 'chat.title')}</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t(locale, 'chat.heading')}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 640,
                lineHeight: 1.6,
                color: 'var(--text-faded)'
              }}
            >
              {t(locale, 'chat.description')}
            </p>
          </div>
        </CollapsiblePageHeader>

        {/* AI 친구 프로필 영역 */}
        <div
          style={{
            borderRadius: 16,
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #fff8ee 0%, #fdf0f8 100%)',
            border: '1px solid var(--border-pencil)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          {/* 프로필 정보 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '2.2rem' }}>
              {aiFriendEmoji}{langFlag}
            </span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#3d2c00' }}>
                {aiFriendName}
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9a7a50' }}>
                오늘 {targetLang.toUpperCase()}로 {aiFriendName}과 대화해 보세요!
              </p>
            </div>
          </div>

          {/* 타이머 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.72rem',
                color: '#bfa98a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              남은 시간
            </p>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: timerColor(remainingSeconds),
                transition: 'color 0.5s ease'
              }}
            >
              {formatTimeMMSS(remainingSeconds)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 20,
            alignItems: 'stretch',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 1fr)'
          }}
        >
          {/* 대화 패널 */}
          <section
            data-testid="chat-conversation-panel"
            style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '68vh' }}
          >
            <div style={panelBadgeStyle}>{t(locale, 'chat.conversation')}</div>
            <div
              ref={conversationScrollRef}
              onScroll={handleConversationScroll}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                scrollbarGutter: 'stable',
                boxSizing: 'border-box',
                paddingLeft: 14,
                paddingRight: 22
              }}
            >
              {conversationMessages.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                  {t(locale, 'chat.empty')}
                </p>
              ) : (
                conversationMessages.map((message, index) => {
                  const isUserMessage = message.role === 'user';
                  const bubbleBackground =
                    isUserMessage
                      ? 'var(--accent-blue)'
                      : message.role === 'assistant'
                        ? '#fde8d8'
                        : 'var(--accent-green)';

                  return (
                    <div
                      key={`${message.role}-${index}-${message.createdAt}`}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                        paddingBottom: 10
                      }}
                    >
                      {/* AI 아바타 (AI 메시지 왼쪽에만) */}
                      {!isUserMessage ? (
                        <span
                          style={{
                            fontSize: '1.4rem',
                            alignSelf: 'flex-end',
                            marginRight: 6,
                            marginBottom: 12,
                            flexShrink: 0
                          }}
                        >
                          {aiFriendEmoji}
                        </span>
                      ) : null}

                      <article
                        style={{
                          position: 'relative',
                          width: '70%',
                          maxWidth: 560,
                          marginLeft: isUserMessage ? 'auto' : 0,
                          marginRight: isUserMessage ? 0 : 'auto',
                          borderRadius: 18,
                          padding: '10px 16px',
                          minHeight: 30,
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'visible',
                          border: '1px solid var(--border-pencil)',
                          boxShadow: '0 3px 8px rgba(44,42,37,0.08)',
                          background: bubbleBackground
                        }}
                      >
                        {/* 말풍선 꼬리 */}
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: isUserMessage ? 'auto' : -12,
                            right: isUserMessage ? -12 : 'auto',
                            bottom: 10,
                            width: 0,
                            height: 0,
                            borderTop: '7px solid transparent',
                            borderBottom: '7px solid transparent',
                            borderLeft: isUserMessage
                              ? `12px solid ${bubbleBackground}`
                              : 'none',
                            borderRight: isUserMessage
                              ? 'none'
                              : `12px solid ${bubbleBackground}`,
                            zIndex: 2
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            minHeight: 0
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 6px',
                              borderRadius: 999,
                              background: 'rgba(255,255,255,0.35)',
                              fontSize: 10,
                              lineHeight: 1,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--text-faded)',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            {labelForRole(locale, message.role, auth.displayName, aiFriendName)}
                          </span>
                          <p
                            style={{
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              minHeight: 0,
                              flex: 1,
                              lineHeight: 1.2,
                              textAlign: 'left'
                            }}
                          >
                            {message.message}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })
              )}
            </div>

            {/* 입력 폼 */}
            <form
              onSubmit={submitMessage}
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                alignItems: 'end',
                flexShrink: 0
              }}
            >
              <label style={{ display: 'grid', gap: 8 }}>
                <span>{t(locale, 'chat.input_label')}</span>
                <textarea
                  aria-label={t(locale, 'chat.input_label')}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  placeholder={isExpired ? '오늘 대화를 모두 사용했어요 💕' : t(locale, 'chat.placeholder')}
                  rows={4}
                  disabled={isExpired}
                  style={{
                    borderRadius: 16,
                    border: '1px solid var(--border-pencil)',
                    padding: '14px 16px',
                    background: isExpired ? '#f5f0e8' : 'transparent',
                    color: isExpired ? 'var(--text-faded)' : 'var(--text-ink)',
                    resize: 'vertical',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    cursor: isExpired ? 'not-allowed' : 'text'
                  }}
                />
              </label>
              <button
                type="submit"
                aria-label="SEND"
                disabled={loading || isExpired}
                style={{
                  width: 'fit-content',
                  height: 84,
                  border: '1px solid var(--btn-primary-border)',
                  borderRadius: 999,
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 700,
                  background:
                    loading || isExpired
                      ? 'var(--btn-disabled-bg)'
                      : 'var(--btn-primary-bg)',
                  color: loading || isExpired ? 'var(--btn-disabled-color)' : '#fff',
                  cursor: loading || isExpired ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                {loading ? t(locale, 'common.status.loading') : 'SEND'}
              </button>
            </form>
          </section>

          {/* 교정 패널 */}
          <section
            style={{
              ...panelStyle,
              display: 'grid',
              gap: 12,
              minHeight: '68vh',
              alignContent: 'start',
              overflowY: 'auto'
            }}
          >
            <div style={panelBadgeStyle}>{t(locale, 'chat.correction')}</div>
            {latestCorrection ? (
              <>
                <div>
                  <h2 style={{ margin: '0 0 8px' }}>
                    {t(locale, 'chat.corrected')}
                  </h2>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    {latestCorrection.corrected ?? latestCorrection.message}
                  </p>
                </div>

                {/* 원어민 팁 섹션 */}
                {feedbackParts.nativeTip ? (
                  <div
                    style={{
                      borderRadius: 12,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#166534',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}
                    >
                      🌟 원어민이라면 이렇게 말해요
                    </p>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#15803d', fontSize: '0.9rem' }}>
                      {feedbackParts.nativeTip}
                    </p>
                  </div>
                ) : null}

                {/* 일반 피드백 */}
                {feedbackParts.corrected || latestCorrection.feedback ? (
                  <div>
                    <h2 style={{ margin: '0 0 8px' }}>
                      {t(locale, 'chat.feedback')}
                    </h2>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                      {feedbackParts.corrected || latestCorrection.feedback}
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                {t(locale, 'chat.correction_empty')}
              </p>
            )}

            {error ? <StatusMessage tone="error" message={error} /> : null}
          </section>
        </div>
      </div>
    </main>
  );
}
