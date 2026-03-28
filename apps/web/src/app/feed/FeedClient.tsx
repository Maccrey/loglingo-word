'use client';

import React, { useState } from 'react';
import { CollapsiblePageHeader } from '../../components/CollapsiblePageHeader';

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
  background: 'var(--accent-pink)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
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
  const [shareRewardMessage, setShareRewardMessage] = useState<string | null>(
    null
  );
  const [shareFlowMessage, setShareFlowMessage] = useState<string | null>(null);

  function getSharePreviewText(post: LearningResultPost) {
    return t(locale, 'feed.share_preview')
      .replace('{user}', post.userId)
      .replace('{points}', String(post.earnedPoints))
      .replace('{streak}', String(post.streak));
  }

  function getShareData(post: LearningResultPost) {
    return {
      title: t(locale, 'feed.heading'),
      text: getSharePreviewText(post),
      url: window.location.href
    };
  }

  async function sharePost(post: LearningResultPost) {
    const shareData = getShareData(post);

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        const shareIntentUrl = new URL('https://twitter.com/intent/tweet');
        shareIntentUrl.searchParams.set('text', shareData.text);
        shareIntentUrl.searchParams.set('url', shareData.url);
        window.open(shareIntentUrl.toString(), '_blank', 'noopener,noreferrer');
      }

      setShareFlowMessage(t(locale, 'feed.share_external_success'));
    } catch {
      setShareFlowMessage(t(locale, 'feed.share_error'));
    }
  }

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <CollapsiblePageHeader locale={locale}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={badgeStyle}>{t(locale, 'feed.title')}</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t(locale, 'feed.heading')}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 640,
                lineHeight: 1.6,
                color: 'var(--text-faded)'
              }}
            >
              {t(locale, 'feed.description')}
            </p>
          </div>
        </CollapsiblePageHeader>

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
                <div style={{ color: 'var(--text-faded)' }}>
                  {t(locale, 'feed.points')} {post.earnedPoints}pt ·{' '}
                  {t(locale, 'feed.streak')} {post.streak}
                </div>
              </div>
              <p style={{ margin: 0, lineHeight: 1.7 }}>{post.body}</p>
              <p style={{ margin: 0, color: 'var(--text-faded)', fontSize: 14 }}>
                {getSharePreviewText(post)}
              </p>
              {post.achievedSentence ? (
                <div
                  style={{
                    borderRadius: 16,
                    padding: '14px 16px',
                    background: 'var(--accent-green)',
                    color: 'var(--text-ink)',
                    border: '1px solid var(--border-pencil)'
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
                    border: '1px solid var(--border-pencil)',
                    padding: '12px 16px',
                    background: post.likedByUser
                      ? 'var(--accent-pink)'
                      : 'transparent',
                    color: 'var(--text-ink)',
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
                      setShareRewardMessage(
                        reward.points > 0
                          ? `${t(locale, 'feed.share_reward')} +${reward.points}pt`
                          : t(locale, 'feed.share_reward_claimed')
                      );
                      return reward.ledger;
                    });
                    props.onShare?.(post);
                    void sharePost(post);
                  }}
                  style={{
                    borderRadius: 999,
                    border: '1px solid var(--border-pencil)',
                    padding: '12px 16px',
                    background: 'var(--accent-blue)',
                    color: 'var(--text-ink)',
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
          {shareRewardMessage ? (
            <p role="status" style={{ margin: 0, color: '#2d7a4d' }}>
              {shareRewardMessage}
            </p>
          ) : null}
          {shareFlowMessage ? (
            <p role="alert" style={{ margin: 0, color: '#2d7a4d' }}>
              {shareFlowMessage}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
