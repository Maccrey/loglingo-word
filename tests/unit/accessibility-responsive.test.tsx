// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FeedClient from '../../apps/web/src/app/feed/FeedClient';
import HomeDashboard from '../../apps/web/src/app/HomeDashboard';
import ChatClient from '../../apps/web/src/app/chat/ChatClient';

afterEach(() => {
  cleanup();
});

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width
  });
  window.dispatchEvent(new Event('resize'));
}

describe('accessibility and responsive layouts', () => {
  it('exposes key interactive controls with accessible names', () => {
    render(<HomeDashboard />);

    expect(screen.getByRole('link', { name: '바로 시작' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '퀴즈 학습' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'AI 대화' })).toBeTruthy();
  });

  it('renders the home dashboard flexibly on a mobile viewport', () => {
    setViewport(375);
    render(<HomeDashboard />);

    const summaryGrid = screen.getByTestId('home-summary-grid');
    expect(summaryGrid.getAttribute('style')).toContain(
      'repeat(auto-fit, minmax(220px, 1fr))'
    );
  });

  it('renders feed and chat layouts on a desktop viewport', () => {
    setViewport(1280);
    render(
      <>
        <FeedClient />
        <ChatClient />
      </>
    );

    expect(
      screen.getByTestId('feed-card-list').getAttribute('style')
    ).toContain('display: grid');
    expect(
      screen.getByTestId('chat-conversation-panel').getAttribute('style')
    ).toContain('display: grid');
    expect(screen.getByRole('button', { name: '메시지 보내기' })).toBeTruthy();
  });
});
