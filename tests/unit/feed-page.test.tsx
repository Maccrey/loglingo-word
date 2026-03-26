// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FeedPage, {
  createSharedFeedPost
} from '../../apps/web/src/app/feed/page';

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
      '추천 단어 2개를 학습하고 8포인트를 획득했어요.'
    );
    expect(post?.body).toContain('리더보드 점수 1점도 반영됐습니다.');
    expect(post?.body).toContain('passport, subway');
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
        /추천 단어 2개를 학습하고 8포인트를 획득했어요\. 리더보드 점수 1점도 반영됐습니다\./
      )
    ).toBeTruthy();
  });
});
