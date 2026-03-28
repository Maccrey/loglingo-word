'use client';

import React, { useEffect, useState } from 'react';
import { CollapsiblePageHeader } from '../../components/CollapsiblePageHeader';
import { useAppAuth } from '../../lib/useAppAuth';
import {
  hasFirebaseWebConfig,
  loadFirebaseFeedComments,
  loadFirebaseFeedPosts
} from '../../lib/firebase-client';
import { publishFeedComment } from '../../lib/feedPublishing';
import {
  loadStoredFeedCommentsByPost,
  loadStoredFeedPosts
} from '../../lib/feedStorage';

import {
  applyShareQuestReward,
  type RewardLedger
} from '@wordflow/core/gamification';
import {
  createAutoLearningResultPost,
  createFeedComment
} from '@wordflow/core/social';
import type { FeedComment, LearningResultPost } from '@wordflow/shared/types';

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

function mergePosts(...groups: LearningResultPost[][]): LearningResultPost[] {
  const merged = new Map<string, LearningResultPost>();

  for (const group of groups) {
    for (const post of group) {
      merged.set(post.id, post);
    }
  }

  return Array.from(merged.values()).sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function feedCardLabel(locale: AppLocale, post: LearningResultPost): string {
  switch (post.type) {
    case 'study_milestone':
      return t(locale, 'feed.card.study_milestone');
    case 'study_comeback':
      return t(locale, 'feed.card.study_comeback');
    case 'cat_growth':
      return t(locale, 'feed.card.cat_growth');
    default:
      return t(locale, 'feed.card.learning_result');
  }
}

export default function FeedClient(props: FeedClientProps) {
  const locale = props.locale ?? 'ko';
  const auth = useAppAuth();
  const [posts, setPosts] = useState<LearningResultPost[]>(
    props.initialPosts ?? buildDemoPosts()
  );
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, FeedComment[]>
  >({});
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});
  const [rewardLedger, setRewardLedger] = useState<RewardLedger>({
    awardedIds: [],
    totalPoints: 0
  });
  const [shareRewardMessage, setShareRewardMessage] = useState<string | null>(
    null
  );
  const [shareFlowMessage, setShareFlowMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setLoading(true);
      const localPosts = loadStoredFeedPosts();
      const remotePosts = hasFirebaseWebConfig()
        ? await loadFirebaseFeedPosts()
        : [];
      const mergedPosts = mergePosts(
        props.initialPosts ?? [],
        localPosts,
        remotePosts
      );
      const nextPosts = mergedPosts.length > 0 ? mergedPosts : buildDemoPosts();

      const entries = await Promise.all(
        nextPosts.map(async (post) => {
          const comments = hasFirebaseWebConfig()
            ? await loadFirebaseFeedComments(post.id)
            : loadStoredFeedCommentsByPost(post.id);

          return [post.id, comments] as const;
        })
      );

      if (cancelled) {
        return;
      }

      setPosts(nextPosts);
      setCommentsByPost(Object.fromEntries(entries));
      setLoading(false);
    }

    void loadFeed();

    return () => {
      cancelled = true;
    };
  }, [props.initialPosts]);

  function getSharePreviewText(post: LearningResultPost) {
    return t(locale, 'feed.share_preview')
      .replace('{user}', post.userDisplayName ?? post.userId)
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

  async function submitComment(post: LearningResultPost) {
    const draft = draftComments[post.id]?.trim();

    if (!draft) {
      return;
    }

    const comment = createFeedComment({
      id: `comment:${post.id}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      postId: post.id,
      userId: auth.userId,
      userDisplayName:
        auth.displayName ??
        (auth.isAuthenticated
          ? auth.email?.split('@')[0] ?? 'Learner'
          : locale === 'en'
            ? 'Guest learner'
            : '게스트 학습자'),
      body: draft,
      createdAt: new Date().toISOString()
    });

    setCommentsByPost((current) => ({
      ...current,
      [post.id]: [...(current[post.id] ?? []), comment]
    }));
    setDraftComments((current) => ({
      ...current,
      [post.id]: ''
    }));

    await publishFeedComment({
      comment,
      syncRemote: auth.isAuthenticated
    });
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
          {loading ? (
            <div style={panelStyle}>{t(locale, 'common.status.loading')}</div>
          ) : null}
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
                  {feedCardLabel(locale, post)}
                </div>
                <div style={{ color: 'var(--text-faded)' }}>
                  {t(locale, 'feed.points')} {post.earnedPoints}pt ·{' '}
                  {t(locale, 'feed.streak')} {post.streak}
                </div>
              </div>
              {post.title ? (
                <h2 style={{ margin: 0, fontSize: 22 }}>{post.title}</h2>
              ) : null}
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
              <section
                style={{
                  display: 'grid',
                  gap: 10,
                  borderTop: '1px solid var(--border-pencil)',
                  paddingTop: 14
                }}
              >
                <strong style={{ fontSize: 14 }}>
                  {t(locale, 'feed.comments')} {commentsByPost[post.id]?.length ?? 0}
                </strong>
                {(commentsByPost[post.id] ?? []).length > 0 ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {(commentsByPost[post.id] ?? []).map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          borderRadius: 12,
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.64)',
                          border: '1px solid var(--border-pencil)'
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: 'var(--text-faded)',
                            marginBottom: 4
                          }}
                        >
                          {comment.userDisplayName}
                        </div>
                        <div style={{ lineHeight: 1.6 }}>{comment.body}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                    {t(locale, 'feed.comment_empty')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    aria-label={`${t(locale, 'feed.comment_input')} ${post.id}`}
                    value={draftComments[post.id] ?? ''}
                    onChange={(event) =>
                      setDraftComments((current) => ({
                        ...current,
                        [post.id]: event.target.value
                      }))
                    }
                    placeholder={t(locale, 'feed.comment_placeholder')}
                    style={{
                      flex: '1 1 320px',
                      minWidth: 0,
                      borderRadius: 999,
                      border: '1px solid var(--border-pencil)',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.82)',
                      color: 'var(--text-ink)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void submitComment(post)}
                    style={{
                      borderRadius: 999,
                      border: '1px solid var(--border-pencil)',
                      padding: '12px 16px',
                      background: 'var(--accent-yellow)',
                      color: 'var(--text-ink)',
                      cursor: 'pointer'
                    }}
                  >
                    {t(locale, 'feed.comment_submit')}
                  </button>
                </div>
              </section>
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
