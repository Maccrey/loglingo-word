// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FeedClient from '../../apps/web/src/app/feed/FeedClient';
import { createAutoLearningResultPost } from '../../services/core/src/social';

afterEach(() => {
  cleanup();
});

describe('feed ui', () => {
  it('renders feed cards', () => {
    render(<FeedClient />);

    expect(screen.getAllByText('SNS 피드').length).toBeGreaterThan(1);
    expect(screen.getAllByText(/포인트/).length).toBeGreaterThan(0);
  });

  it('toggles the like state', async () => {
    const user = userEvent.setup();

    render(
      <FeedClient
        initialPosts={[
          createAutoLearningResultPost({
            id: 'post-like',
            userId: 'user-1',
            earnedPoints: 10,
            streak: 3,
            createdAt: '2026-03-26T00:00:00.000Z'
          })
        ]}
      />
    );

    const likeButton = screen.getByRole('button', { name: '좋아요 post-like' });
    await user.click(likeButton);

    expect(likeButton.textContent).toContain('1');
  });

  it('fires the share cta and increments the share count', async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();

    render(
      <FeedClient
        initialPosts={[
          createAutoLearningResultPost({
            id: 'post-share',
            userId: 'user-1',
            earnedPoints: 14,
            streak: 4,
            createdAt: '2026-03-26T00:00:00.000Z'
          })
        ]}
        onShare={onShare}
      />
    );

    const shareButton = screen.getByRole('button', { name: '공유 post-share' });
    await user.click(shareButton);

    expect(shareButton.textContent).toContain('1');
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('blocks duplicate share rewards for the same post', async () => {
    const user = userEvent.setup();

    render(
      <FeedClient
        initialPosts={[
          createAutoLearningResultPost({
            id: 'post-reward',
            userId: 'user-1',
            earnedPoints: 14,
            streak: 4,
            createdAt: '2026-03-26T00:00:00.000Z'
          })
        ]}
      />
    );

    const shareButton = screen.getByRole('button', {
      name: '공유 post-reward'
    });
    await user.click(shareButton);
    expect(screen.getByRole('status').textContent).toContain('공유 보상 +8pt');

    await user.click(shareButton);
    expect(screen.getByRole('status').textContent).toContain(
      '이미 공유 보상을 받았습니다.'
    );
  });
});
