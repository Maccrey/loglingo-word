'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { calculateRecommendedStudyOutcome } from '@wordflow/core/gamification';
import { type StudyRating } from '@wordflow/core/learning';
import { calculateLeaderboardScore } from '@wordflow/leaderboard';

import {
  createFlashcardSession,
  flipCurrentCard,
  getCurrentCard,
  rateCurrentCard
} from './flashcards';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background:
    'radial-gradient(circle at top, rgba(255, 244, 214, 0.95), rgba(242, 107, 76, 0.12) 36%, rgba(19, 31, 44, 0.96) 100%)',
  color: '#f7f3ea'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 960,
  margin: '0 auto',
  display: 'grid',
  gap: 24
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 28,
  padding: 24,
  background: 'rgba(12, 20, 31, 0.72)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 80px rgba(6, 10, 16, 0.28)',
  backdropFilter: 'blur(14px)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  width: 'fit-content',
  borderRadius: 999,
  padding: '8px 14px',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  background: 'rgba(247, 190, 88, 0.14)',
  color: '#f7d487'
};

const ratingButtonPalette: Record<
  StudyRating,
  { background: string; color: string }
> = {
  easy: {
    background: '#d5ff74',
    color: '#172110'
  },
  normal: {
    background: '#8ce7ff',
    color: '#0f2231'
  },
  hard: {
    background: '#ff8b7b',
    color: '#35110d'
  }
};

function reasonLabel(reason: string): string {
  switch (reason) {
    case 'retry':
      return '다시 확인';
    case 'review':
      return '복습 타이밍';
    default:
      return '새 단어';
  }
}

type FlashcardsClientProps = {
  focusWordIds?: string[];
};

export default function FlashcardsClient(props: FlashcardsClientProps) {
  const [session, setSession] = useState(() =>
    createFlashcardSession(
      props.focusWordIds ? { focusWordIds: props.focusWordIds } : undefined
    )
  );

  const currentCard = getCurrentCard(session);
  const reviewedCount = session.logs.length;
  const totalCount = session.cards.length;
  const completed = currentCard === null;
  const recommendationOutcome = calculateRecommendedStudyOutcome(
    `recommended:${(props.focusWordIds ?? []).join(',')}`,
    reviewedCount
  );
  const leaderboardDelta = calculateLeaderboardScore({
    correctStreak: reviewedCount
  }).score;
  const shareHref =
    props.focusWordIds && props.focusWordIds.length > 0
      ? `/feed?source=recommendation&completed=${reviewedCount}&points=${recommendationOutcome.reward.points}&leaderboard=${leaderboardDelta}&words=${encodeURIComponent(
          props.focusWordIds.join(',')
        )}`
      : null;
  const leaderboardHref =
    props.focusWordIds && props.focusWordIds.length > 0
      ? `/leaderboard?source=recommendation&score=${leaderboardDelta}&userId=demo-user`
      : null;
  const homeHref =
    props.focusWordIds && props.focusWordIds.length > 0
      ? `/?source=recommendation&points=${recommendationOutcome.reward.points}&leaderboard=${leaderboardDelta}`
      : null;

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 18 }}>
          <div style={badgeStyle}>Today&apos;s Study</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              alignItems: 'end'
            }}
          >
            <div style={{ display: 'grid', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                Flashcard Sprint
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: 580,
                  color: 'rgba(247, 243, 234, 0.78)',
                  lineHeight: 1.6
                }}
              >
                오늘은 틀린 단어를 먼저 다시 잡고, 복습이 도래한 카드 다음으로
                새 단어를 이어서 학습합니다.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 6,
                minWidth: 180,
                textAlign: 'right'
              }}
            >
              <strong style={{ fontSize: 32 }}>
                {reviewedCount}/{totalCount}
              </strong>
              <span style={{ color: 'rgba(247, 243, 234, 0.72)' }}>
                완료한 카드 수
              </span>
              <span style={{ color: 'rgba(247, 212, 135, 0.86)' }}>
                오답 큐 {session.wrongWordQueue.length}개
              </span>
              {props.focusWordIds && props.focusWordIds.length > 0 ? (
                <span style={{ color: 'rgba(140, 231, 255, 0.9)' }}>
                  추천 단어 {props.focusWordIds.length}개
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section
          style={{
            ...panelStyle,
            display: 'grid',
            gap: 18
          }}
        >
          {completed ? (
            <div style={{ display: 'grid', gap: 14 }}>
              <span style={badgeStyle}>Session Complete</span>
              <h2 style={{ margin: 0, fontSize: 34 }}>
                오늘 학습을 마쳤습니다.
              </h2>
              <p style={{ margin: 0, color: 'rgba(247, 243, 234, 0.75)' }}>
                마지막 난이도 선택: {session.lastRating ?? '없음'}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/" style={{ color: '#f7d487' }}>
                  홈으로 돌아가기
                </Link>
                {homeHref ? (
                  <Link href={homeHref} style={{ color: '#b7f8db' }}>
                    홈 요약 반영 보기
                  </Link>
                ) : null}
                {shareHref ? (
                  <Link href={shareHref} style={{ color: '#8ce7ff' }}>
                    추천 학습 결과 공유
                  </Link>
                ) : null}
                {leaderboardHref ? (
                  <Link href={leaderboardHref} style={{ color: '#d9c0ff' }}>
                    리더보드 반영 보기
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <span style={badgeStyle}>
                  {reasonLabel(currentCard.reason)}
                </span>
                <span style={{ color: 'rgba(247, 243, 234, 0.72)' }}>
                  카드 {session.currentIndex + 1} / {totalCount}
                </span>
              </div>

              <article
                aria-live="polite"
                style={{
                  borderRadius: 24,
                  minHeight: 320,
                  padding: 28,
                  display: 'grid',
                  gap: 18,
                  alignContent: 'space-between',
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <div style={{ display: 'grid', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(247, 243, 234, 0.56)'
                    }}
                  >
                    {session.flipped ? 'Meaning' : 'Word'}
                  </span>
                  <strong style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}>
                    {session.flipped
                      ? currentCard.word.meaning
                      : currentCard.word.term}
                  </strong>
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(247, 243, 234, 0.82)',
                      lineHeight: 1.6
                    }}
                  >
                    {session.flipped
                      ? currentCard.word.example
                      : '먼저 단어를 떠올린 뒤 카드를 뒤집어 의미와 예문을 확인하세요.'}
                  </p>
                  {session.flipped ? (
                    <p
                      style={{
                        margin: 0,
                        color: 'rgba(247, 212, 135, 0.9)'
                      }}
                    >
                      난이도를 선택하면 다음 카드로 진행됩니다.
                    </p>
                  ) : null}
                </div>
              </article>

              <div
                style={{
                  display: 'grid',
                  gap: 12
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSession((current) => flipCurrentCard(current))
                  }
                  style={{
                    border: 0,
                    borderRadius: 18,
                    padding: '16px 18px',
                    fontSize: 16,
                    fontWeight: 700,
                    background: '#f7d487',
                    color: '#211609',
                    cursor: 'pointer'
                  }}
                >
                  {session.flipped ? '앞면으로 보기' : '카드 뒤집기'}
                </button>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 10
                  }}
                >
                  {(['easy', 'normal', 'hard'] as const).map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      disabled={!session.flipped}
                      onClick={() =>
                        setSession((current) =>
                          rateCurrentCard(
                            current,
                            rating,
                            '2026-03-25T12:00:00.000Z'
                          )
                        )
                      }
                      style={{
                        border: 0,
                        borderRadius: 18,
                        padding: '16px 14px',
                        fontSize: 16,
                        fontWeight: 700,
                        background: ratingButtonPalette[rating].background,
                        color: ratingButtonPalette[rating].color,
                        opacity: session.flipped ? 1 : 0.45,
                        cursor: session.flipped ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {rating === 'easy'
                        ? 'Easy'
                        : rating === 'normal'
                          ? 'Normal'
                          : 'Hard'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
