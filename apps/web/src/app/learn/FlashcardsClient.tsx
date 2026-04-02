'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { updateSettings } from '@wordflow/core/settings';
import { getCurriculumByStandardLevel } from '@wordflow/core/curriculum';
import {
  getLearningLevelLabel,
  getNextLearningLevel
} from '@wordflow/shared/learning-preferences';
import { BackButton } from '../../components/BackButton';
import { CollapsiblePageHeader } from '../../components/CollapsiblePageHeader';
import { type AppLocale } from '../i18n';
import {
  readStoredSettingsSnapshot,
  saveStoredSettings,
  USER_SETTINGS_UPDATED_EVENT
} from '../../lib/settingsStorage';
import {
  calculateMasteredWordRatio,
  readStoredLearningProgressSnapshot,
  saveStoredLearningProgress
} from '../../lib/learningProgressStorage';
import { useAppAuth } from '../../lib/useAppAuth';
import { useCat } from '../../lib/useCat';
import { publishFeedPost } from '../../lib/feedPublishing';
import {
  shouldCreateStudyComebackPost,
  shouldCreateStudyMilestonePost
} from '../../lib/feedEvents';
import { useTimedLearningReward } from '../../lib/useTimedLearningReward';
import { getTodayLearnedSnapshot, saveTodayLearned } from '../../lib/dailyProgressStorage';

import { calculateRecommendedStudyOutcome } from '@wordflow/core/gamification';
import { type StudyRating } from '@wordflow/core/learning';
import { calculateLeaderboardScore } from '@wordflow/leaderboard';
import {
  createStudyComebackPost,
  createStudyMilestonePost
} from '@wordflow/core/social';

import {
  answerMiniRecall,
  createFlashcardSession,
  DAILY_WORD_GOAL,
  flipCurrentCard,
  getCurrentCard,
  rateCurrentCard
} from './flashcards';

// 미니 사이클 포인트
const MINI_CYCLE_POINT_REWARD = 10;

/* ────────────────────────────────── 스타일 상수 ────────────────────────────────── */
const surfaceStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'transparent',
  color: 'var(--text-ink)'
};

const shellStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 960,
  margin: '0 auto',
  display: 'grid',
  gap: 28
};

const panelStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: 32,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-pencil)',
  boxShadow: 'var(--shadow-card)'
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  width: 'fit-content',
  borderRadius: 999,
  padding: '6px 14px',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 700,
  background: 'var(--accent-pink)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)'
};

const ratingButtonPalette: Record<
  StudyRating,
  { background: string; color: string; emoji: string; label: string }
> = {
  easy: {
    background: 'var(--accent-green)',
    color: 'var(--text-ink)',
    emoji: '😄',
    label: '쉬워요'
  },
  normal: {
    background: 'var(--accent-blue)',
    color: 'var(--text-ink)',
    emoji: '🙂',
    label: '보통이에요'
  },
  hard: {
    background: 'var(--accent-orange)',
    color: 'var(--text-ink)',
    emoji: '😅',
    label: '어려워요'
  }
};

/* ────────────────────────────────── 헬퍼 함수 ────────────────────────────────── */
function getPhaseLabel(phase: string, batchCompleted: number, batchSize: number): string {
  if (phase === 'mini_recall') {
    return '🧠 미니 리콜';
  }
  return `단어 ${batchCompleted + 1} / ${batchSize}`;
}

/* ────────────────────────────────── 컴포넌트 ────────────────────────────────── */
type FlashcardsClientProps = {
  locale?: AppLocale;
  focusWordIds?: string[];
};

export default function FlashcardsClient(props: FlashcardsClientProps) {
  const locale = props.locale ?? 'ko';
  const auth = useAppAuth();
  const { grantLearningReward, grantLearningPoints, flushSync } = useCat();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const cachedAudioUrlsRef = useRef<Map<string, string>>(new Map());

  const [storedSettings, setStoredSettings] = useState(() =>
    readStoredSettingsSnapshot()
  );
  
  // 오늘 이미 학습한 기초 양 (새로고침 시 유지용)
  const [initialDailyProgress] = useState(() => getTodayLearnedSnapshot());

  const [session, setSession] = useState(() =>
    createFlashcardSession(
      props.focusWordIds
        ? { focusWordIds: props.focusWordIds }
        : {
            learningLanguage: readStoredSettingsSnapshot().learningLanguage,
            learningLevel: readStoredSettingsSnapshot().learningLevel,
            progressList: auth.isAuthenticated
              ? readStoredLearningProgressSnapshot()
              : [],
            limit: DAILY_WORD_GOAL
          }
    )
  );

  const [autoAdvanceMessage, setAutoAdvanceMessage] = useState<string | null>(null);
  const [leaderboardSyncState, setLeaderboardSyncState] = useState({
    loading: false,
    synced: false
  });

  // 미니 리콜 결과 애니메이션 상태
  const [recallFeedback, setRecallFeedback] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    selectedTerm: string;
  }>({ status: 'idle', selectedTerm: '' });

  const completionTrackedRef = useRef(false);

  const currentCard = getCurrentCard(session);
  const reviewedCount = session.logs.length;
  const totalCount = session.cards.length;
  const completed = session.phase === 'done';
  const isMiniRecall = session.phase === 'mini_recall';

  const recommendationOutcome = calculateRecommendedStudyOutcome(
    `recommended:${(props.focusWordIds ?? []).join(',')}`,
    reviewedCount
  );
  const leaderboardDelta = calculateLeaderboardScore({
    correctStreak: reviewedCount
  }).score;

  const shareHref =
    props.focusWordIds && props.focusWordIds.length > 0
      ? `/feed?source=recommendation&completed=${reviewedCount}&points=${recommendationOutcome.reward.points}&leaderboard=${leaderboardDelta}&words=${encodeURIComponent(props.focusWordIds.join(','))}`
      : null;
  const leaderboardHref =
    props.focusWordIds && props.focusWordIds.length > 0
      ? `/leaderboard?source=recommendation&score=${leaderboardDelta}&userId=demo-user`
      : null;
  const homeHref =
    props.focusWordIds && props.focusWordIds.length > 0
      ? `/?source=recommendation&points=${recommendationOutcome.reward.points}&leaderboard=${leaderboardDelta}`
      : null;

  useTimedLearningReward({
    active: !completed,
    grantPoints: grantLearningPoints
  });

  const fallbackSpeakWord = useCallback((text: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: 'en-US',
      ko: 'ko-KR',
      ja: 'ja-JP',
      zh: 'zh-CN',
      de: 'de-DE'
    };
    utterance.lang = langMap[storedSettings.learningLanguage] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [storedSettings.learningLanguage]);

  const stopWordAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    audioUrlRef.current = null;
  }, []);

  const speakWord = useCallback(
    async (text: string) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        stopWordAudio();
        const cacheKey = `${storedSettings.learningLanguage}:${text.trim().toLowerCase()}`;
        const cachedAudioUrl = cachedAudioUrlsRef.current.get(cacheKey);

        if (cachedAudioUrl) {
          const cachedAudio = new Audio(cachedAudioUrl);
          audioUrlRef.current = cachedAudioUrl;
          audioRef.current = cachedAudio;
          await cachedAudio.play();
          return;
        }

        const ttsUrl = new URL('/api/tts', window.location.origin);
        ttsUrl.searchParams.set('text', text);
        ttsUrl.searchParams.set('language', storedSettings.learningLanguage);

        const response = await fetch(ttsUrl.toString(), {
          method: 'GET',
          cache: 'force-cache'
        });

        if (!response.ok) {
          throw new Error(`TTS request failed with status ${response.status}.`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        cachedAudioUrlsRef.current.set(cacheKey, audioUrl);
        audioUrlRef.current = audioUrl;
        audioRef.current = audio;
        await audio.play();
      } catch (error) {
        console.warn(
          '[FlashcardsClient] XTTS playback failed, using browser fallback.',
          error
        );
        fallbackSpeakWord(text);
      }
    },
    [fallbackSpeakWord, stopWordAudio, storedSettings.learningLanguage]
  );

  /* ── 설정 동기화 ── */
  useEffect(() => {
    if (props.focusWordIds && props.focusWordIds.length > 0) {
      return;
    }

    function syncFromStoredSettings() {
      const nextSettings = readStoredSettingsSnapshot();
      setStoredSettings(nextSettings);
      setSession(
        createFlashcardSession({
          learningLanguage: nextSettings.learningLanguage,
          learningLevel: nextSettings.learningLevel,
          progressList: auth.isAuthenticated
            ? readStoredLearningProgressSnapshot()
            : [],
          limit: DAILY_WORD_GOAL
        })
      );
    }

    syncFromStoredSettings();
    window.addEventListener(USER_SETTINGS_UPDATED_EVENT, syncFromStoredSettings);

    return () => {
      window.removeEventListener(USER_SETTINGS_UPDATED_EVENT, syncFromStoredSettings);
    };
  }, [auth.isAuthenticated, props.focusWordIds]);

  useEffect(() => () => {
    stopWordAudio();
    cachedAudioUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    cachedAudioUrlsRef.current.clear();
  }, [stopWordAudio]);

  /* ── 학습 진행 저장 ── */
  useEffect(() => {
    if (props.focusWordIds && props.focusWordIds.length > 0) {
      return;
    }
    if (!auth.isAuthenticated) {
      return;
    }

    const progress = Object.values(session.progressMap);
    saveStoredLearningProgress(progress);
    void auth.saveLearningState({
      settings: readStoredSettingsSnapshot(),
      progress
    });
  }, [auth, auth.isAuthenticated, props.focusWordIds, session.progressMap]);

  /* ── 레벨 자동 승급 ── */
  useEffect(() => {
    if (!completed || (props.focusWordIds && props.focusWordIds.length > 0)) {
      return;
    }

    const currentLevelWords = getCurriculumByStandardLevel(
      storedSettings.learningLanguage,
      storedSettings.learningLevel
    ).flatMap((unit) => unit.words.map((word) => word.id));
    const masteredRatio = calculateMasteredWordRatio(
      currentLevelWords,
      Object.values(session.progressMap)
    );

    if (masteredRatio < 0.9) {
      setAutoAdvanceMessage(null);
      return;
    }

    const nextLevel = getNextLearningLevel(
      storedSettings.learningLanguage,
      storedSettings.learningLevel
    );

    if (!nextLevel) {
      setAutoAdvanceMessage('현재 학습 언어의 최고 레벨까지 완료했습니다. 🎉');
      return;
    }

    const nextSettings = updateSettings(
      storedSettings,
      { learningLevel: nextLevel },
      '2026-03-27T00:00:00.000Z'
    );

    saveStoredSettings(nextSettings);
    setAutoAdvanceMessage(
      `현재 레벨 단어의 90% 이상을 암기해서 다음 레벨 ${getLearningLevelLabel(nextSettings.learningLanguage, nextLevel)}(으)로 자동 승급되었습니다! 🚀`
    );
  }, [
    completed,
    locale,
    props.focusWordIds,
    session.progressMap,
    storedSettings
  ]);

  /* ── 리더보드 동기화 ── */
  useEffect(() => {
    if (
      !completed ||
      !props.focusWordIds ||
      props.focusWordIds.length === 0 ||
      leaderboardSyncState.loading ||
      leaderboardSyncState.synced ||
      leaderboardDelta === 0
    ) {
      return;
    }

    let cancelled = false;

    async function syncLeaderboard() {
      setLeaderboardSyncState({ loading: true, synced: false });

      try {
        await fetch('/api/leaderboard/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'demo-user',
            scoreDelta: leaderboardDelta,
            now: '2026-03-26T00:00:00.000Z'
          })
        });
      } finally {
        if (!cancelled) {
          setLeaderboardSyncState({ loading: false, synced: true });
        }
      }
    }

    void syncLeaderboard();

    return () => { cancelled = true; };
  }, [
    completed,
    leaderboardDelta,
    leaderboardSyncState.loading,
    leaderboardSyncState.synced,
    props.focusWordIds
  ]);

  /* ── 세션 완료 처리 ── */
  useEffect(() => {
    if (!completed) {
      completionTrackedRef.current = false;
      return;
    }

    if (completionTrackedRef.current) {
      return;
    }

    completionTrackedRef.current = true;

    const learnedAt = new Date().toISOString();
    const completedCount = Math.max(1, session.todayLearnedCount || reviewedCount);
    const earnedPoints = grantLearningReward({
      wordsMemorized: completedCount
    });

    if (auth.isAuthenticated) {
      void (async () => {
        const result = await auth.recordLearningSession({
          completedCount,
          learnedAt,
          dailyGoalTarget: storedSettings.sessionQuestionCount
        });

        // 세션 종료 결과 저장 후 최종 데이터 강제 동기화 (디바운싱 대기 방지)
        await Promise.all([
          flushSync(),
          auth.flushSaveLearningState()
        ]);

        if (!result) {
          return;
        }

        const comebackDays = shouldCreateStudyComebackPost({
          previousSummary: result.previousSummary,
          learnedAt
        });

        if (comebackDays) {
          const eventKey = `study-comeback:${auth.userId}:${learnedAt.slice(0, 10)}`;
          await publishFeedPost({
            post: createStudyComebackPost({
              id: eventKey,
              userId: auth.userId,
              createdAt: learnedAt,
              daysAway: comebackDays,
              streak: result.summary.currentStreak,
              eventKey,
              ...(auth.displayName ? { userDisplayName: auth.displayName } : {})
            }),
            syncRemote: true
          });
        }

        if (
          shouldCreateStudyMilestonePost({
            previousSummary: result.previousSummary,
            nextSummary: result.summary
          })
        ) {
          const eventKey = `study-milestone:${auth.userId}:${learnedAt.slice(0, 10)}`;
          await publishFeedPost({
            post: createStudyMilestonePost({
              id: eventKey,
              userId: auth.userId,
              createdAt: learnedAt,
              completedCount: result.summary.todayCompleted,
              earnedPoints,
              streak: result.summary.currentStreak,
              eventKey,
              ...(auth.displayName ? { userDisplayName: auth.displayName } : {})
            }),
            syncRemote: true
          });
        }
      })();
    }
  }, [
    auth,
    completed,
    grantLearningReward,
    reviewedCount,
    session.todayLearnedCount,
    storedSettings.sessionQuestionCount
  ]);

  /* ── 카드 뒤집기 시 자동 발음 ── */
  const handleFlip = () => {
    const shouldSpeak = !session.flipped && Boolean(currentCard);
    const nextWord = currentCard?.word.term;

    setSession((s) => flipCurrentCard(s));

    if (shouldSpeak && nextWord) {
      void speakWord(nextWord);
    }
  };

  /* ── 미니 리콜 응답 핸들러 ── */
  function handleMiniRecallAnswer(selectedTerm: string) {
    const currentQuestion =
      session.miniRecall?.questions[session.miniRecall.currentIndex];
    if (!currentQuestion) {
      return;
    }

    const isCorrect = selectedTerm === currentQuestion.correctTerm;

    setRecallFeedback({
      status: isCorrect ? 'correct' : 'wrong',
      selectedTerm
    });
    
    // 정답 시 발음 들려주기
    if (isCorrect) {
      void speakWord(selectedTerm);
    }

    setTimeout(() => {
      setRecallFeedback({ status: 'idle', selectedTerm: '' });

      setSession((current) => {
        const result = answerMiniRecall(current, selectedTerm);

        // 미니 사이클 완료 시 포인트 지급 및 로컬 저장
        if (result.cycleJustCompleted) {
          const totalLearned = initialDailyProgress.count + result.todayLearnedCount;
          const totalCycles = initialDailyProgress.cycles + result.completedCycles;
          saveTodayLearned(totalLearned, totalCycles);
          
          setTimeout(() => {
            grantLearningPoints(MINI_CYCLE_POINT_REWARD);
          }, 0);
        }

        return result;
      });
    }, 700);
  }

  /* ── 하루 목표 진척 바 ── */
  const todayProgress = initialDailyProgress.count + session.todayLearnedCount;
  const progressPercent = Math.min(
    100,
    Math.round((todayProgress / DAILY_WORD_GOAL) * 100)
  );
  
  const totalCycles = initialDailyProgress.cycles + session.completedCycles;

  /* ── 어려웠던 단어 복습 ── */
  const handleReviewHardWords = () => {
    const hardWordIds = Array.from(new Set(
      session.logs
        .filter(log => log.rating === 'hard')
        .map(log => log.wordId)
    ));
    
    if (hardWordIds.length === 0) {
      alert('어렵게 표시된 단어가 없습니다.');
      return;
    }
    
    // 세션 초기화 (어려운 단어들로만)
    setSession(createFlashcardSession({
      focusWordIds: hardWordIds
    }));
  };

  /* ────────────────────────────────── 렌더 ────────────────────────────────── */
  return (
    <main style={surfaceStyle}>
      <style>{`
        @keyframes cardFlipIn {
          from { opacity: 0; transform: rotateY(25deg) scale(0.97); }
          to   { opacity: 1; transform: rotateY(0deg) scale(1); }
        }
        @keyframes cardFlipOut {
          from { opacity: 1; transform: rotateY(0deg) scale(1); }
          to   { opacity: 0; transform: rotateY(-25deg) scale(0.97); }
        }
        @keyframes correctBounce {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes wrongShake {
          0%  { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          100%{ transform: translateX(0); }
        }
        .recall-correct { animation: correctBounce 0.4s ease forwards; }
        .recall-wrong   { animation: wrongShake   0.4s ease forwards; }
      `}</style>

      <div style={shellStyle}>
        {/* ── 헤더 ── */}
        <CollapsiblePageHeader locale={locale} expandedMinHeight={160}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={badgeStyle}>✨ 새 단어 학습</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                alignItems: 'end'
              }}
            >
              <div style={{ display: 'grid', gap: 6 }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 5vw, 3.2rem)' }}>
                  Word Sprint
                </h1>
                <p
                  style={{
                    margin: 0,
                    maxWidth: 520,
                    color: 'var(--text-faded)',
                    lineHeight: 1.6,
                    fontSize: '0.92rem'
                  }}
                >
                  5개 단어를 익히고 → 미니 리콜로 바로 확인! 반복이 기억을 만듭니다.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 4, textAlign: 'right' }}>
                <strong style={{ fontSize: 28 }}>
                  {todayProgress}
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-faded)' }}>
                    {' '}/ {DAILY_WORD_GOAL}
                  </span>
                </strong>
                <span style={{ fontSize: 12, color: 'var(--text-faded)' }}>오늘 목표 단어</span>
              </div>
            </div>
          </div>
        </CollapsiblePageHeader>

        {/* ── 하루 목표 진척 바 ── */}
        <div
          style={{
            ...panelStyle,
            padding: '20px 28px',
            display: 'grid',
            gap: 10
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
              🎯 오늘 목표 달성도
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                color:
                  progressPercent >= 100
                    ? '#2d7a4d'
                    : progressPercent >= 60
                    ? '#e8a030'
                    : 'var(--text-faded)'
              }}
            >
              {progressPercent >= 100
                ? '🎉 목표 달성!'
                : `${todayProgress}개 완료 · ${DAILY_WORD_GOAL - todayProgress}개 남음`}
            </span>
          </div>

          {/* 진척 바 컨테이너 */}
          <div
            style={{
              height: 14,
              borderRadius: 999,
              background: 'var(--border-pencil)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                borderRadius: 999,
                background:
                  progressPercent >= 100
                    ? 'linear-gradient(90deg, #4caf50, #81c784)'
                    : progressPercent >= 60
                    ? 'linear-gradient(90deg, #ffa726, #ffcc80)'
                    : 'linear-gradient(90deg, var(--btn-primary-bg), #f7c68a)',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>

          {/* 미니 사이클 완료 배지 */}
          {totalCycles > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array.from({ length: totalCycles }).map((_, i) => (
                <span
                  key={i}
                  title={`사이클 ${i + 1} 완료 · +${MINI_CYCLE_POINT_REWARD}P`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    borderRadius: 999,
                    padding: '3px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'var(--accent-green)',
                    border: '1px solid var(--border-pencil)'
                  }}
                >
                  ✅ +{MINI_CYCLE_POINT_REWARD}P
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── 메인 학습 패널 ── */}
        <section style={{ ...panelStyle, display: 'grid', gap: 20 }}>

          {/* ── 완료 화면 ── */}
          {completed ? (
            <div style={{ 
              display: 'grid', 
              gap: '2rem',
              maxWidth: '600px',
              margin: '0 auto',
              width: '100%'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                }} />

                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 800, 
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>학습 완료!</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                  오늘의 성장을 축하합니다.
                </p>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1rem',
                  marginBottom: '2.5rem'
                }}>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>학습 단어</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155' }}>{session.logs.length}개</div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#3b82f6', marginBottom: '0.25rem' }}>획득 포인트</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d4ed8' }}>+{totalCycles * MINI_CYCLE_POINT_REWARD}pts</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '0.25rem' }}>일일 달성</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#047857' }}>{Math.min(100, Math.round((todayProgress / DAILY_WORD_GOAL) * 100))}%</div>
                  </div>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📖 학습한 단어 리스트
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    background: '#f1f5f9',
                    borderRadius: '12px'
                  }}>
                    {session.logs.map((log, i) => {
                      const word = session.cards.find(c => c.word.id === log.wordId)?.word;
                      return (
                        <span key={i} style={{
                          padding: '4px 12px',
                          background: 'white',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          color: log.rating === 'hard' ? '#ef4444' : '#475569',
                          border: log.rating === 'hard' ? '1px solid #fee2e2' : '1px solid #e2e8f0',
                          fontWeight: log.rating === 'hard' ? 600 : 400
                        }}>
                          {word?.term}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {session.logs.some(l => l.rating === 'hard') && (
                    <button
                      onClick={handleReviewHardWords}
                      style={{
                        padding: '1rem',
                        background: '#fff1f2',
                        color: '#be123c',
                        border: '1px solid #fecdd3',
                        borderRadius: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      어려웠던 단어 다시 공부하기 🔥
                    </button>
                  )}
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      padding: '1rem',
                      background: '#1e293b',
                      color: 'white',
                      borderRadius: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    홈으로 돌아가기
                  </button>
                </div>
              </div>
            </div>

          /* ── 미니 리콜 라운드 ── */
          ) : isMiniRecall && session.miniRecall ? (
            (() => {
              const recall = session.miniRecall;
              const currentQ = recall.questions[recall.currentIndex];
              if (!currentQ) {
                return null;
              }

              return (
                <div style={{ display: 'grid', gap: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8
                    }}
                  >
                    <span
                      style={{
                        ...badgeStyle,
                        background: 'var(--accent-blue)'
                      }}
                    >
                      🧠 미니 리콜 {recall.currentIndex + 1} / {recall.questions.length}
                    </span>
                    <span style={{ color: 'var(--text-faded)', fontSize: '0.85rem' }}>
                      맞힌 수: {recall.correctCount}
                    </span>
                  </div>

                  {/* 리콜 문제 카드 */}
                  <article
                    style={{
                      borderRadius: 20,
                      padding: '32px 28px',
                      minHeight: 180,
                      display: 'grid',
                      gap: 14,
                      alignContent: 'center',
                      justifyItems: 'center',
                      textAlign: 'center',
                      background: 'rgba(214, 242, 250, 0.35)',
                      border: '1.5px dashed var(--border-pencil)',
                      animation: 'cardFlipIn 0.3s ease'
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--text-faded)'
                      }}
                    >
                      이 뜻에 해당하는 단어는?
                    </span>
                    <strong style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', lineHeight: 1.3 }}>
                      {currentQ.prompt}
                    </strong>
                  </article>

                  {/* 2지선다 선택지 */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12
                    }}
                  >
                    {currentQ.options.map((term) => {
                      const isSelected = recallFeedback.selectedTerm === term;
                      const isCorrect = term === currentQ.correctTerm;
                      let background = 'var(--bg-card)';
                      let borderColor = 'var(--border-pencil)';
                      let animClass = '';

                      if (isSelected && recallFeedback.status === 'correct') {
                        background = 'var(--accent-green)';
                        borderColor = '#4caf50';
                        animClass = 'recall-correct';
                      } else if (isSelected && recallFeedback.status === 'wrong') {
                        background = '#ffebee';
                        borderColor = '#ef5350';
                        animClass = 'recall-wrong';
                      } else if (
                        recallFeedback.status === 'wrong' &&
                        isCorrect &&
                        recallFeedback.selectedTerm
                      ) {
                        // 오답 선택 시 정답 하이라이트
                        background = 'var(--accent-green)';
                        borderColor = '#4caf50';
                      }

                      return (
                        <button
                          key={term}
                          type="button"
                          disabled={recallFeedback.status !== 'idle'}
                          onClick={() => handleMiniRecallAnswer(term)}
                          className={animClass}
                          style={{
                            borderRadius: 18,
                            border: `2px solid ${borderColor}`,
                            padding: '20px 16px',
                            textAlign: 'center',
                            background,
                            color: 'var(--text-ink)',
                            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                            fontWeight: 700,
                            cursor:
                              recallFeedback.status === 'idle'
                                ? 'pointer'
                                : 'default',
                            boxShadow: 'var(--shadow-card)',
                            transition:
                              'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (recallFeedback.status === 'idle') {
                              (e.currentTarget as HTMLButtonElement).style.transform =
                                'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform =
                              'translateY(0)';
                          }}
                        >
                          {term}
                        </button>
                      );
                    })}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: 'var(--text-faded)',
                      textAlign: 'center'
                    }}
                  >
                    💡 미니 리콜 완료 후 <strong>+{MINI_CYCLE_POINT_REWARD}포인트</strong>가 지급됩니다
                  </p>
                </div>
              );
            })()

          /* ── 단어 학습 카드 (introduce phase) ── */
          ) : currentCard ? (
            <>
              {/* 배치/단계 헤더 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8
                }}
              >
                <span style={badgeStyle}>
                  {getPhaseLabel(
                    session.phase,
                    session.batchCompletedCount,
                    session.batchSize
                  )}
                </span>
                <span style={{ color: 'var(--text-faded)', fontSize: '0.85rem' }}>
                  전체 {session.currentIndex + 1} / {totalCount}
                  {' · '}오답 다시보기 {session.wrongWordQueue.length}개
                </span>
              </div>

              {/* 단어 카드 */}
              <article
                key={`card-${session.currentIndex}-${session.flipped ? 'back' : 'front'}`}
                aria-live="polite"
                style={{
                  borderRadius: 24,
                  minHeight: 280,
                  padding: '32px 28px',
                  display: 'grid',
                  gap: 16,
                  alignContent: 'space-between',
                  background: session.flipped
                    ? 'linear-gradient(135deg, rgba(209, 235, 216, 0.4), rgba(214, 242, 250, 0.4))'
                    : 'transparent',
                  border: '1.5px solid var(--border-pencil)',
                  boxShadow: 'var(--shadow-card)',
                  animation: 'cardFlipIn 0.3s ease',
                  transition: 'background 0.4s ease'
                }}
              >
                {/* 앞면: 단어 + 발음 */}
                {!session.flipped ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--text-faded)'
                      }}
                    >
                      📖 새 단어
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <strong
                        style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.1 }}
                      >
                        {currentCard.word.term}
                      </strong>
                      <button
                        onClick={() => speakWord(currentCard.word.term)}
                        style={{
                          background: 'var(--accent-blue)',
                          border: '1px solid var(--border-pencil)',
                          borderRadius: '50%',
                          width: 44,
                          height: 44,
                          fontSize: 20,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-card)'
                        }}
                        title="발음 듣기"
                      >
                        🔊
                      </button>
                    </div>
                    {currentCard.word.reading ? (
                      <span
                        style={{
                          fontSize: '1.1rem',
                          color: 'var(--text-faded)',
                          fontWeight: 400
                        }}
                      >
                        [{currentCard.word.reading}]
                      </span>
                    ) : null}
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-faded)',
                        fontSize: '0.9rem'
                      }}
                    >
                      먼저 이 단어를 눈에 담아보세요. 준비가 되면 의미를 확인하세요 👇
                    </p>
                  </div>
                ) : (
                  /* 뒷면: 의미 + 예문 */
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'var(--text-faded)'
                        }}
                      >
                        💡 의미
                      </span>
                      <strong
                        style={{
                          fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
                          lineHeight: 1.2
                        }}
                      >
                        {currentCard.word.meaning}
                      </strong>
                    </div>

                    {currentCard.word.example ? (
                      <div
                        style={{
                          borderRadius: 12,
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.6)',
                          border: '1px dashed var(--border-pencil)'
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--text-faded)',
                            display: 'block',
                            marginBottom: 4
                          }}
                        >
                          예문
                        </span>
                        <p
                          style={{
                            margin: 0,
                            lineHeight: 1.6,
                            color: 'var(--text-ink)',
                            fontSize: '0.95rem'
                          }}
                        >
                          {currentCard.word.example}
                        </p>
                      </div>
                    ) : null}

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--text-faded)'
                      }}
                    >
                      이 단어가 얼마나 기억에 남았나요? 난이도를 선택해주세요.
                    </p>
                  </div>
                )}
              </article>

              {/* 액션 버튼 영역 */}
              <div style={{ display: 'grid', gap: 12 }}>
                {/* 카드 뒤집기 버튼 */}
                {!session.flipped && (
                  <button
                    type="button"
                    onClick={handleFlip}
                    style={{
                      border: 0,
                      borderRadius: 18,
                      padding: '18px',
                      fontSize: 16,
                      fontWeight: 700,
                      background: 'var(--btn-primary-bg)',
                      color: '#fff',
                      boxShadow: 'var(--shadow-card)',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                  >
                    의미 확인하기 →
                  </button>
                )}

                {/* 난이도 버튼 (뒤집힌 상태에서만) */}
                {session.flipped && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 10
                    }}
                  >
                    {(['easy', 'normal', 'hard'] as const).map((rating) => {
                      const palette = ratingButtonPalette[rating];

                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setSession((s) =>
                              rateCurrentCard(s, rating, new Date().toISOString())
                            )
                          }
                          style={{
                            border: '1px solid var(--border-pencil)',
                            borderRadius: 18,
                            padding: '16px 10px',
                            fontSize: 14,
                            fontWeight: 700,
                            background: palette.background,
                            color: palette.color,
                            boxShadow: 'var(--shadow-card)',
                            cursor: 'pointer',
                            display: 'grid',
                            gap: 4,
                            placeItems: 'center',
                            transition: 'transform 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform =
                              'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform =
                              'translateY(0)';
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{palette.emoji}</span>
                          <span>{palette.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
