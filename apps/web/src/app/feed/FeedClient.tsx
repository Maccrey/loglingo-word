'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import {
  applyShareQuestReward,
  type RewardLedger
} from '@wordflow/core/gamification';
import { createAutoLearningResultPost } from '@wordflow/core/social';
import type { LearningResultPost } from '@wordflow/shared/types';

import { t, type AppLocale } from '../i18n';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'linear-gradient(180deg, #f6efe6 0%, #ffd0b8 14%, #173143 100%)',
  color: '#f7f4ef'
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
  background: 'rgba(255, 209, 184, 0.16)',
  color: '#ffd699',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

type FeedClientProps = {
  locale?: AppLocale;
  initialPosts?: LearningResultPost[];
  onShare?: (post: LearningResultPost) => void;
};

function buildDemoPosts(): LearningResultPost[] {
  return [
    createAutoLearningResultPost({
      id: 'post-1',
      userId: 'demo-user',
      earnedPoints: 24,
      streak: 5,
      achievedSentence: 'I went to the airport early this morning.',
      createdAt: '2026-03-26T00:00:00.000Z'
    }),
    createAutoLearningResultPost({
      id: 'post-2',
      userId: 'demo-user',
      earnedPoints: 12,
      streak: 2,
      createdAt: '2026-03-25T00:00:00.000Z'
    })
  ];
}

function toggleLike(post: LearningResultPost): LearningResultPost {
  return {
    ...post,
    likedByUser: !post.likedByUser,
    likeCount: post.likedByUser
      ? Math.max(0, post.likeCount - 1)
      : post.likeCount + 1
  };
}

function incrementShare(post: LearningResultPost): LearningResultPost {
  return {
    ...post,
    shareCount: post.shareCount + 1
  };
}

export default function FeedClient(props: FeedClientProps) {
  const locale = props.locale ?? 'ko';
  const [posts, setPosts] = useState<LearningResultPost[]>(
    props.initialPosts ?? buildDemoPosts()
  );
  const [rewardLedger, setRewardLedger] = useState<RewardLedger>({
    awardedIds: [],
    totalPoints: 0
  });
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'feed.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'feed.heading')}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 640,
              lineHeight: 1.6,
              color: 'rgba(247, 244, 239, 0.8)'
            }}
          >
            {t(locale, 'feed.description')}
          </p>
          <Link href="/" style={{ color: '#ffd699' }}>
            {t(locale, 'common.action.back_home')}
          </Link>
        </section>

        <section
          data-testid="feed-card-list"
          style={{ display: 'grid', gap: 18 }}
        >
          {posts.map((post) => (
            <article
              key={post.id}
              style={{ ...panelStyle, display: 'grid', gap: 14 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap'
                }}
              >
                <div style={badgeStyle}>
                  {t(locale, 'feed.card.learning_result')}
                </div>
                <div style={{ color: 'rgba(247, 244, 239, 0.7)' }}>
                  {t(locale, 'feed.points')} {post.earnedPoints}pt ·{' '}
                  {t(locale, 'feed.streak')} {post.streak}
                </div>
              </div>
              <p style={{ margin: 0, lineHeight: 1.7 }}>{post.body}</p>
              {post.achievedSentence ? (
                <div
                  style={{
                    borderRadius: 18,
                    padding: '14px 16px',
                    background: 'rgba(183, 248, 219, 0.12)',
                    color: '#dfffea'
                  }}
                >
                  {post.achievedSentence}
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  aria-label={`${t(locale, 'feed.like')} ${post.id}`}
                  onClick={() =>
                    setPosts((current) =>
                      current.map((item) =>
                        item.id === post.id ? toggleLike(item) : item
                      )
                    )
                  }
                  style={{
                    borderRadius: 999,
                    border: 0,
                    padding: '12px 16px',
                    background: post.likedByUser
                      ? '#ffb4a8'
                      : 'rgba(255,255,255,0.08)',
                    color: post.likedByUser ? '#2b1511' : '#f7f4ef',
                    cursor: 'pointer'
                  }}
                >
                  {t(locale, 'feed.like')} {post.likeCount}
                </button>
                <button
                  type="button"
                  aria-label={`${t(locale, 'feed.share')} ${post.id}`}
                  onClick={() => {
                    setPosts((current) =>
                      current.map((item) =>
                        item.id === post.id ? incrementShare(item) : item
                      )
                    );
                    setRewardLedger((current: RewardLedger) => {
                      const reward = applyShareQuestReward(post.id, current);
                      setShareMessage(
                        reward.points > 0
                          ? `${t(locale, 'feed.share_reward')} +${reward.points}pt`
                          : t(locale, 'feed.share_reward_claimed')
                      );
                      return reward.ledger;
                    });
                    props.onShare?.(post);
                  }}
                  style={{
                    borderRadius: 999,
                    border: 0,
                    padding: '12px 16px',
                    background: '#8ce7ff',
                    color: '#102533',
                    cursor: 'pointer'
                  }}
                >
                  {t(locale, 'feed.share')} {post.shareCount}
                </button>
              </div>
            </article>
          ))}
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 10 }}>
          <div style={badgeStyle}>{t(locale, 'feed.reward_status')}</div>
          <p style={{ margin: 0 }}>
            {t(locale, 'feed.total_reward_points')} {rewardLedger.totalPoints}pt
          </p>
          {shareMessage ? (
            <p role="status" style={{ margin: 0, color: '#b7f8db' }}>
              {shareMessage}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
