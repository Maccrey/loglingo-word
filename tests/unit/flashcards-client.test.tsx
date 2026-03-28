// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurriculumByStandardLevel } from '@wordflow/core/curriculum';

import FlashcardsClient from '../../apps/web/src/app/learn/FlashcardsClient';
const useAppAuthMock = vi.fn(() => ({
  status: 'authenticated',
  userId: 'demo-user',
  displayName: '테스트 사용자',
  email: 'tester@example.com',
  needsTermsConsent: false,
  authReady: true,
  isAuthenticated: true,
  isGuest: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  acceptTerms: vi.fn(),
  saveLearningState: vi.fn(async () => true)
}));

vi.mock('../../apps/web/src/lib/useAppAuth', () => ({
  useAppAuth: () => useAppAuthMock()
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

beforeEach(() => {
  vi.restoreAllMocks();
  useAppAuthMock.mockReset();
  useAppAuthMock.mockReturnValue({
    status: 'authenticated',
    userId: 'demo-user',
    displayName: '테스트 사용자',
    email: 'tester@example.com',
    needsTermsConsent: false,
    authReady: true,
    isAuthenticated: true,
    isGuest: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    acceptTerms: vi.fn(),
    saveLearningState: vi.fn(async () => true)
  });
});

describe('flashcards ui', () => {
  it('renders the current word and flips to show its meaning', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    expect(screen.getByText('I')).toBeTruthy();
    expect(screen.queryByText('나')).toBeNull();

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));

    expect(screen.getByText('나')).toBeTruthy();
    expect(screen.getByText('I am a student.')).toBeTruthy();
  });

  it('moves to the next card when a rating button is clicked', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(screen.getByText('you')).toBeTruthy();
    expect(screen.getByText('카드 2 / 10')).toBeTruthy();
  });

  it('does not persist learning progress in guest mode', async () => {
    const user = userEvent.setup();
    useAppAuthMock.mockReturnValue({
      status: 'guest',
      userId: 'demo-user',
      displayName: null,
      email: null,
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: false,
      isGuest: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => false)
    });

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(window.localStorage.getItem('mock_learning_progress')).toBeNull();
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
      <FlashcardsClient focusWordIds={['passport', 'reservation', 'teacher']} />
    );

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/leaderboard/sync',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
    expect(
      screen
        .getByRole('link', { name: '리더보드 반영 보기' })
        .getAttribute('href')
    ).toBe('/leaderboard?source=recommendation&score=1&userId=demo-user');
  });

  it('uses stored learning settings to load Japanese starter words', () => {
    window.localStorage.setItem(
      'mock_user_settings',
      JSON.stringify({
        userId: 'demo-user',
        appLanguage: 'ko',
        learningLanguage: 'ja',
        learningLevel: 'jlpt_n5',
        sessionQuestionCount: 5,
        notificationsEnabled: true,
        premiumEnabled: false,
        updatedAt: '2026-03-26T00:00:00.000Z'
      })
    );

    render(<FlashcardsClient />);

    expect(screen.getByText('こんにちは')).toBeTruthy();
    expect(screen.getByText('카드 1 / 5')).toBeTruthy();
  });

  it('renders writing mode for japanese cards and validates the answer', async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(
      'mock_user_settings',
      JSON.stringify({
        userId: 'demo-user',
        appLanguage: 'ko',
        learningLanguage: 'ja',
        learningLevel: 'jlpt_n5',
        sessionQuestionCount: 5,
        notificationsEnabled: true,
        premiumEnabled: false,
        updatedAt: '2026-03-26T00:00:00.000Z'
      })
    );

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    expect(screen.getByText('쓰기 모드')).toBeTruthy();
    expect(screen.getByText(/읽기 힌트: こんにちは/)).toBeTruthy();

    await user.type(screen.getByRole('textbox', { name: '쓰기 정답' }), 'こんにちは');
    await user.click(screen.getByRole('button', { name: '쓰기 확인' }));

    expect(screen.getByRole('status').textContent).toContain(
      '정답입니다. 저장된 쓰기 정답과 일치합니다.'
    );
  });

  it('submits the writing answer when Enter is pressed', async () => {
    const user = userEvent.setup();

    window.localStorage.setItem(
      'mock_user_settings',
      JSON.stringify({
        userId: 'demo-user',
        appLanguage: 'ko',
        learningLanguage: 'ja',
        learningLevel: 'jlpt_n5',
        sessionQuestionCount: 5,
        notificationsEnabled: true,
        premiumEnabled: false,
        updatedAt: '2026-03-26T00:00:00.000Z'
      })
    );

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    const input = screen.getByRole('textbox', { name: '쓰기 정답' });
    await user.type(input, 'こんにちは{enter}');

    expect(screen.getByRole('status').textContent).toContain(
      '정답입니다. 저장된 쓰기 정답과 일치합니다.'
    );
  });

  it('automatically advances to the next level and refreshes the session when 90% of the current level is mastered', async () => {
    const user = userEvent.setup();
    const a1WordIds = getCurriculumByStandardLevel('en', 'cefr_a1').flatMap(
      (unit) => unit.words.map((word) => word.id)
    );
    const seededProgress = a1WordIds.map((wordId) => ({
      wordId,
      correctStreak: ['i', 'you'].includes(wordId) ? 1 : 2,
      storageStrength: ['i', 'you'].includes(wordId) ? 0.6 : 1.1,
      retrievalStrength: ['i', 'you'].includes(wordId) ? 0.5 : 0.9,
      nextReviewAt: ['i', 'you'].includes(wordId)
        ? '2026-03-24T00:00:00.000Z'
        : '2026-04-24T00:00:00.000Z'
    }));

    window.localStorage.setItem(
      'mock_user_settings',
      JSON.stringify({
        userId: 'demo-user',
        appLanguage: 'ko',
        learningLanguage: 'en',
        learningLevel: 'cefr_a1',
        sessionQuestionCount: 2,
        notificationsEnabled: true,
        premiumEnabled: false,
        updatedAt: '2026-03-26T00:00:00.000Z'
      })
    );
    window.localStorage.setItem(
      'mock_learning_progress',
      JSON.stringify(seededProgress)
    );

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    await waitFor(() => {
      expect(
        JSON.parse(window.localStorage.getItem('mock_user_settings') ?? '{}')
          .learningLevel
      ).toBe('cefr_a2');
    });
    expect(screen.getByText('reservation')).toBeTruthy();
    expect(screen.getByText('카드 1 / 2')).toBeTruthy();
  });
});
