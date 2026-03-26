// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import FlashcardsClient from '../../apps/web/src/app/learn/FlashcardsClient';

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('flashcards ui', () => {
  it('renders the current word and flips to show its meaning', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    expect(screen.getByText('hello')).toBeTruthy();
    expect(screen.queryByText('안녕하세요')).toBeNull();

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));

    expect(screen.getByText('안녕하세요')).toBeTruthy();
    expect(screen.getByText('Hello, nice to meet you.')).toBeTruthy();
  });

  it('moves to the next card when a rating button is clicked', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(screen.getByText('subway')).toBeTruthy();
    expect(screen.getByText('카드 2 / 4')).toBeTruthy();
  });

  it('renders a focused recommendation session when word ids are provided', () => {
    render(<FlashcardsClient focusWordIds={['passport', 'reservation']} />);

    expect(screen.getByText('passport')).toBeTruthy();
    expect(screen.getByText('카드 1 / 2')).toBeTruthy();
    expect(screen.getByText('추천 단어 2개')).toBeTruthy();
  });

  it('shows a share link after completing a focused recommendation session', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({})
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(<FlashcardsClient focusWordIds={['passport']} />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(
      screen
        .getByRole('link', { name: '추천 학습 결과 공유' })
        .getAttribute('href')
    ).toBe(
      '/feed?source=recommendation&completed=1&points=10&leaderboard=0&words=passport'
    );
    expect(
      screen
        .getByRole('link', { name: '리더보드 반영 보기' })
        .getAttribute('href')
    ).toBe('/leaderboard?source=recommendation&score=0&userId=demo-user');
    expect(
      screen
        .getByRole('link', { name: '홈 요약 반영 보기' })
        .getAttribute('href')
    ).toBe('/?source=recommendation&points=10&leaderboard=0');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('syncs leaderboard score when a focused recommendation session awards leaderboard points', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({})
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <FlashcardsClient focusWordIds={['passport', 'reservation', 'subway']} />
    );

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/leaderboard/sync',
      expect.objectContaining({
        method: 'POST'
      })
    );
    expect(
      screen
        .getByRole('link', { name: '리더보드 반영 보기' })
        .getAttribute('href')
    ).toBe('/leaderboard?source=recommendation&score=1&userId=demo-user');
  });
});
