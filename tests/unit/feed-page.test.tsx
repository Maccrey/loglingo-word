// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FeedPage from '../../apps/web/src/app/feed/page';
import { createSharedFeedPost } from '../../apps/web/src/app/feed/shared-post';

afterEach(() => {
  cleanup();
});

describe('feed page', () => {
  it('builds a shared recommendation post from search params', () => {
    const post = createSharedFeedPost({
      source: 'recommendation',
      completed: '2',
      points: '8',
      leaderboard: '1',
      words: 'passport,subway'
    });

    expect(post?.body).toContain(
      '추천 단어 2개를 학습해 8포인트를 획득했고 리더보드 점수 1점도 반영됐어요.'
    );
    expect(post?.body).toContain('복습 완료 단어: passport, subway.');
  });

  it('prepends the shared recommendation post to the feed', async () => {
    const page = await FeedPage({
      searchParams: Promise.resolve({
        source: 'recommendation',
        completed: '2',
        points: '8',
        leaderboard: '1',
        words: 'passport,subway'
      })
    });

    render(page);

    expect(
      screen.getByText(
        /추천 단어 2개를 학습해 8포인트를 획득했고 리더보드 점수 1점도 반영됐어요\./
      )
    ).toBeTruthy();
  });
});
