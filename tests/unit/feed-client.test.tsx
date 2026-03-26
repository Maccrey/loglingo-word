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
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: share
    });

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
    expect(share).toHaveBeenCalledWith({
      title: 'SNS 피드',
      text: 'user-1님이 14pt를 획득했고 연속 학습 4일을 기록했습니다.',
      url: `${window.location.origin}/`
    });
  });

  it('blocks duplicate share rewards for the same post', async () => {
    const user = userEvent.setup();
    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined)
    });

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

  it('falls back to an external share url when web share is unavailable', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: undefined
    });

    render(
      <FeedClient
        initialPosts={[
          createAutoLearningResultPost({
            id: 'post-external-share',
            userId: 'user-2',
            earnedPoints: 9,
            streak: 2,
            createdAt: '2026-03-26T00:00:00.000Z'
          })
        ]}
      />
    );

    await user.click(
      screen.getByRole('button', { name: '공유 post-external-share' })
    );

    const externalShareUrl = new URL(String(open.mock.calls[0]?.[0]));

    expect(open).toHaveBeenCalledTimes(1);
    expect(externalShareUrl.origin).toBe('https://twitter.com');
    expect(externalShareUrl.pathname).toBe('/intent/tweet');
    expect(externalShareUrl.searchParams.get('text')).toBe(
      'user-2님이 9pt를 획득했고 연속 학습 2일을 기록했습니다.'
    );
    expect(screen.getByRole('alert').textContent).toContain(
      '현재 피드 카드 공유 화면을 열었습니다.'
    );
  });
});
