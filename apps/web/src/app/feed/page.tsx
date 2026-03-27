import React from 'react';

import FeedClient from './FeedClient';
import { createSharedFeedPost } from './shared-post';
import { resolveLocale } from '../i18n';

import { createAutoLearningResultPost } from '@wordflow/core/social';
import type { LearningResultPost } from '@wordflow/shared/types';

type FeedPageProps = {
  searchParams?: Promise<{
    locale?: string;
    source?: string;
    completed?: string;
    points?: string;
    leaderboard?: string;
    words?: string;
  }>;
};

function buildInitialPosts(sharedPost: LearningResultPost | null) {
  const demoPosts = [
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

  return sharedPost ? [sharedPost, ...demoPosts] : demoPosts;
}

export default async function FeedPage(props: FeedPageProps) {
  const searchParams = await props.searchParams;
  const sharedPost = createSharedFeedPost(searchParams ?? {});

  return (
    <FeedClient
      locale={resolveLocale(searchParams?.locale)}
      initialPosts={buildInitialPosts(sharedPost)}
    />
  );
}
