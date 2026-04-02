// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurriculumByStandardLevel } from '@wordflow/core/curriculum';

import FlashcardsClient from '../../apps/web/src/app/learn/FlashcardsClient';

function getCurrentRecallPromptText() {
  return document.querySelector('article strong')?.textContent ?? '';
}

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
  saveLearningState: vi.fn(async () => true),
  flushSaveLearningState: vi.fn(async () => {}),
  recordLearningSession: vi.fn(async () => null)
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
    saveLearningState: vi.fn(async () => true),
    flushSaveLearningState: vi.fn(async () => {}),
    recordLearningSession: vi.fn(async () => null)
  });
  vi.stubGlobal('SpeechSynthesisUtterance', function (this: { text: string }, text: string) {
    this.text = text;
  } as unknown as typeof SpeechSynthesisUtterance);
  vi.stubGlobal('speechSynthesis', {
    cancel: vi.fn(),
    speak: vi.fn()
  });
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    blob: async () => new Blob(['tts']),
    json: async () => ({})
  })));
  Object.defineProperty(globalThis.URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(() => 'blob:mock-audio')
  });
  Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn()
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
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

  it('moves to the next card when the next button is clicked', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));

    expect(screen.getByText('you')).toBeTruthy();
    expect(screen.getByText('단어 2 / 5')).toBeTruthy();
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
      saveLearningState: vi.fn(async () => false),
      flushSaveLearningState: vi.fn(async () => {}),
      recordLearningSession: vi.fn(async () => null)
    });

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));

    expect(window.localStorage.getItem('mock_learning_progress')).toBeNull();
  });

  it('renders a focused recommendation session when word ids are provided', () => {
    render(<FlashcardsClient focusWordIds={['passport', 'reservation']} />);

    expect(screen.getByText('passport')).toBeTruthy();
    expect(screen.getByText('전체 1 / 2 · 오답 다시보기 0개')).toBeTruthy();
  });

  it('shows the completion screen after completing a focused recommendation session', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient focusWordIds={['passport']} />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));

    expect(screen.getByText('학습 완료!')).toBeTruthy();
    expect(screen.getByRole('button', { name: '홈으로 돌아가기' })).toBeTruthy();
    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.some(
        (call) => call[0] === '/api/leaderboard/sync'
      )
    ).toBe(false);
  });

  it('syncs leaderboard score when a focused recommendation session awards leaderboard points', async () => {
    const user = userEvent.setup();

    render(
      <FlashcardsClient focusWordIds={['passport', 'reservation', 'teacher']} />
    );

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));

    const meaningToTerm: Record<string, string> = {
      여권: 'passport',
      예약: 'reservation',
      선생님: 'teacher'
    };

    for (let i = 0; i < 3; i += 1) {
      const prompt = getCurrentRecallPromptText();
      await user.click(screen.getByRole('button', { name: meaningToTerm[prompt] }));
      await waitFor(() => {
        if (i < 2) {
          expect(screen.getByText(`🧠 미니 리콜 ${i + 2} / 3`)).toBeTruthy();
        } else {
          expect(screen.getByText('학습 완료!')).toBeTruthy();
        }
      });
    }

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/leaderboard/sync',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
    expect(screen.getByText('학습 완료!')).toBeTruthy();
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
    expect(screen.getByText('단어 1 / 5')).toBeTruthy();
  });

  it('automatically advances to the next level and refreshes the session when 90% of the current level is mastered', async () => {
    const user = userEvent.setup();
    const a1WordIds = getCurriculumByStandardLevel('en', 'cefr_a1').flatMap(
      (unit) => unit.words.map((word) => word.id)
    );
    const seededProgress = a1WordIds.map((wordId) => ({
      wordId,
      correctStreak: ['i', 'you'].includes(wordId) ? 2 : 3,
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
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));
    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: '다음으로 →' }));

    const firstAnswer = getCurrentRecallPromptText().includes('나') ? 'I' : 'you';
    await user.click(screen.getByRole('button', { name: firstAnswer }));
    await waitFor(() => {
      expect(screen.getByText('🧠 미니 리콜 2 / 2')).toBeTruthy();
    }, { timeout: 1500 });

    const secondAnswer = firstAnswer === 'I' ? 'you' : 'I';
    await user.click(screen.getByRole('button', { name: secondAnswer }));
    await waitFor(() => {
      expect(screen.getByText('학습 완료!')).toBeTruthy();
    }, { timeout: 1500 });
    await waitFor(() => {
      expect(
        JSON.parse(window.localStorage.getItem('mock_user_settings') ?? '{}')
          .learningLevel
      ).toBe('cefr_a2');
    }, { timeout: 2000 });
    expect(screen.getByText('reservation')).toBeTruthy();
    expect(screen.getByText('전체 1 / 2 · 오답 다시보기 0개')).toBeTruthy();
  }, 10000);
});
