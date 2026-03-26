'use client';

import React from 'react';
import Link from 'next/link';

import { type LeaderboardEntryRecord } from '@wordflow/leaderboard';
import { getLeaderboardWeek } from '@wordflow/leaderboard';
import { t, type AppLocale } from '../i18n';

type LeaderboardClientProps = {
  entries?: LeaderboardEntryRecord[];
  currentUserId?: string;
  pendingScoreDelta?: number;
};

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'linear-gradient(180deg, #f5efe4 0%, #e0c9ff 16%, #16263d 100%)',
  color: '#fbf8ff'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 24
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 28,
  padding: 24,
  background: 'rgba(12, 20, 31, 0.78)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 80px rgba(6, 10, 16, 0.28)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '8px 14px',
  background: 'rgba(213, 184, 255, 0.15)',
  color: '#e4caff',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

export default function LeaderboardClient(props: LeaderboardClientProps) {
  const locale: AppLocale = 'ko';
  const {
    entries = [],
    currentUserId = 'demo-user',
    pendingScoreDelta
  } = props;
  const currentWeek = getLeaderboardWeek('2026-03-25T12:00:00.000Z');
  const myEntry =
    entries.find((entry) => entry.userId === currentUserId) ?? null;

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'leaderboard.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'leaderboard.heading')}
          </h1>
          <p
            style={{
              margin: 0,
              lineHeight: 1.6,
              color: 'rgba(251, 248, 255, 0.8)'
            }}
          >
            {currentWeek.weekId} · {currentWeek.weekStart} ~{' '}
            {currentWeek.weekEnd}
          </p>
          <Link href="/" style={{ color: '#e4caff' }}>
            {t(locale, 'common.action.back_home')}
          </Link>
        </section>

        {pendingScoreDelta && pendingScoreDelta > 0 ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            <div style={badgeStyle}>Weekly Update</div>
            <p style={{ margin: 0, color: '#dfffea' }}>
              이번 추천 학습으로 리더보드 점수 {pendingScoreDelta}점이
              반영됐습니다.
            </p>
          </section>
        ) : null}

        {entries.length === 0 ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            <div style={badgeStyle}>{t(locale, 'common.status.empty')}</div>
            <h2 style={{ margin: 0 }}>{t(locale, 'leaderboard.empty')}</h2>
            <p style={{ margin: 0, color: 'rgba(251, 248, 255, 0.72)' }}>
              이번 주 첫 학습으로 순위표를 시작하세요.
            </p>
          </section>
        ) : (
          <>
            <section style={{ ...panelStyle, display: 'grid', gap: 12 }}>
              <div style={badgeStyle}>{t(locale, 'leaderboard.ranking')}</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {entries.map((entry) => {
                  const isMe = entry.userId === currentUserId;

                  return (
                    <article
                      key={`${entry.weekId}-${entry.userId}`}
                      data-current-user={isMe ? 'true' : 'false'}
                      style={{
                        borderRadius: 20,
                        padding: '16px 18px',
                        display: 'grid',
                        gridTemplateColumns: '72px 1fr auto',
                        gap: 12,
                        alignItems: 'center',
                        background: isMe
                          ? 'rgba(228, 202, 255, 0.16)'
                          : 'rgba(255,255,255,0.04)',
                        border: isMe
                          ? '1px solid rgba(228, 202, 255, 0.45)'
                          : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <strong>#{entry.rank}</strong>
                      <span>{isMe ? '나' : entry.userId}</span>
                      <strong>{entry.score} pt</strong>
                    </article>
                  );
                })}
              </div>
            </section>

            {myEntry ? (
              <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
                <div style={badgeStyle}>
                  {t(locale, 'leaderboard.my_position')}
                </div>
                <p style={{ margin: 0 }}>
                  현재 순위 #{myEntry.rank} · {myEntry.score}pt
                </p>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
