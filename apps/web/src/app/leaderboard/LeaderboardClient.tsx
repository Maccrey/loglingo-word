'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { type LeaderboardEntryRecord } from '@wordflow/leaderboard';
import { getLeaderboardWeek } from '@wordflow/leaderboard';
import { t, type AppLocale } from '../i18n';

type LeaderboardClientProps = {
  entries?: LeaderboardEntryRecord[];
  currentUserId?: string;
  focusedUserId?: string;
  pendingScoreDelta?: number;
};

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
  background: 'var(--accent-blue)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
};

function getFocusedWindow(
  entries: LeaderboardEntryRecord[],
  focusedUserId: string
): LeaderboardEntryRecord[] {
  const focusedIndex = entries.findIndex(
    (entry) => entry.userId === focusedUserId
  );

  if (focusedIndex < 0) {
    return [];
  }

  return entries.slice(Math.max(0, focusedIndex - 1), focusedIndex + 2);
}

export default function LeaderboardClient(props: LeaderboardClientProps) {
  const locale: AppLocale = 'ko';
  const {
    entries = [],
    currentUserId = 'demo-user',
    focusedUserId = currentUserId,
    pendingScoreDelta
  } = props;
  const [activeFocusedUserId, setActiveFocusedUserId] = useState(focusedUserId);
  const currentWeek = getLeaderboardWeek('2026-03-25T12:00:00.000Z');
  const focusedEntry =
    entries.find((entry) => entry.userId === activeFocusedUserId) ?? null;
  const isViewingOwnEntry = activeFocusedUserId === currentUserId;
  const focusedWindow = getFocusedWindow(entries, activeFocusedUserId);
  const [viewMode, setViewMode] = useState<'all' | 'nearby'>('all');

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
              color: 'var(--text-faded)'
            }}
          >
            {currentWeek.weekId} · {currentWeek.weekStart} ~{' '}
            {currentWeek.weekEnd}
          </p>
          <Link
            href="/"
            style={{ color: 'var(--text-ink)', textDecoration: 'underline' }}
          >
            {t(locale, 'common.action.back_home')}
          </Link>
        </section>

        {pendingScoreDelta && pendingScoreDelta > 0 ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            <div style={badgeStyle}>Weekly Update</div>
            <p style={{ margin: 0, color: '#2d7a4d' }}>
              이번 추천 학습으로 리더보드 점수 {pendingScoreDelta}점이
              반영됐습니다.
            </p>
          </section>
        ) : null}

        {entries.length === 0 ? (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            <div style={badgeStyle}>{t(locale, 'common.status.empty')}</div>
            <h2 style={{ margin: 0 }}>{t(locale, 'leaderboard.empty')}</h2>
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              이번 주 첫 학습으로 순위표를 시작하세요.
            </p>
          </section>
        ) : (
          <>
            {focusedWindow.length > 0 ? (
              <section style={{ ...panelStyle, display: 'grid', gap: 12 }}>
                <div style={badgeStyle}>{t(locale, 'leaderboard.view')}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    aria-pressed={viewMode === 'all'}
                    style={{
                      borderRadius: 999,
                      border: '1px solid var(--border-pencil)',
                      padding: '8px 14px',
                      background:
                        viewMode === 'all'
                          ? 'var(--accent-blue)'
                          : 'transparent',
                      color: 'var(--text-ink)',
                      cursor: 'pointer'
                    }}
                  >
                    {t(locale, 'leaderboard.view_all')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('nearby')}
                    aria-pressed={viewMode === 'nearby'}
                    style={{
                      borderRadius: 999,
                      border: '1px solid var(--border-pencil)',
                      padding: '8px 14px',
                      background:
                        viewMode === 'nearby'
                          ? 'var(--accent-blue)'
                          : 'transparent',
                      color: 'var(--text-ink)',
                      cursor: 'pointer'
                    }}
                  >
                    {t(locale, 'leaderboard.view_nearby')}
                  </button>
                </div>
              </section>
            ) : null}

            {viewMode === 'all' ? (
              <section style={{ ...panelStyle, display: 'grid', gap: 12 }}>
                <div style={badgeStyle}>{t(locale, 'leaderboard.ranking')}</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {entries.map((entry) => {
                    const isCurrentUser = entry.userId === currentUserId;
                    const isFocused = entry.userId === activeFocusedUserId;

                    return (
                      <article
                        key={`${entry.weekId}-${entry.userId}`}
                        data-current-user={isCurrentUser ? 'true' : 'false'}
                        data-focused-user={isFocused ? 'true' : 'false'}
                        style={{
                          borderRadius: 20,
                          padding: '16px 18px',
                          display: 'grid',
                          gridTemplateColumns: '72px 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          color: 'var(--text-ink)',
                          background: isCurrentUser
                            ? 'var(--accent-pink)'
                            : isFocused
                              ? 'var(--accent-blue)'
                              : 'transparent',
                          border: isFocused
                            ? '2px solid var(--border-pencil)'
                            : '1px solid var(--border-pencil)'
                        }}
                      >
                        <strong>#{entry.rank}</strong>
                        <span>{isCurrentUser ? '나' : entry.userId}</span>
                        <strong>{entry.score} pt</strong>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {focusedEntry ? (
              <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
                <div style={badgeStyle}>
                  {isViewingOwnEntry
                    ? t(locale, 'leaderboard.my_position')
                    : t(locale, 'leaderboard.focused_position')}
                </div>
                <p style={{ margin: 0 }}>
                  {isViewingOwnEntry
                    ? '현재 순위'
                    : `${focusedEntry.userId} 순위`}{' '}
                  #{focusedEntry.rank} · {focusedEntry.score}pt
                </p>
                {!isViewingOwnEntry ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFocusedUserId(currentUserId);
                      setViewMode('all');
                    }}
                    style={{
                      width: 'fit-content',
                      borderRadius: 999,
                      border: '1px solid var(--border-pencil)',
                      padding: '8px 14px',
                      background: 'var(--accent-pink)',
                      color: 'var(--text-ink)',
                      cursor: 'pointer'
                    }}
                  >
                    {t(locale, 'leaderboard.back_to_me')}
                  </button>
                ) : null}
              </section>
            ) : null}

            {focusedWindow.length > 0 && viewMode === 'nearby' ? (
              <section style={{ ...panelStyle, display: 'grid', gap: 12 }}>
                <div style={badgeStyle}>{t(locale, 'leaderboard.nearby')}</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {focusedWindow.map((entry) => {
                    const isCurrentUser = entry.userId === currentUserId;
                    const isFocused = entry.userId === activeFocusedUserId;

                    return (
                      <article
                        key={`nearby-${entry.weekId}-${entry.userId}`}
                        data-nearby-user={isFocused ? 'true' : 'false'}
                        style={{
                          borderRadius: 16,
                          padding: '14px 16px',
                          display: 'grid',
                          gridTemplateColumns: '56px 1fr auto',
                          gap: 10,
                          alignItems: 'center',
                          color: 'var(--text-ink)',
                          background: isFocused
                            ? 'var(--accent-blue)'
                            : isCurrentUser
                              ? 'var(--accent-pink)'
                              : 'transparent',
                          border: '1px solid var(--border-pencil)'
                        }}
                      >
                        <strong>#{entry.rank}</strong>
                        <span>{isCurrentUser ? '나' : entry.userId}</span>
                        <strong>{entry.score} pt</strong>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
