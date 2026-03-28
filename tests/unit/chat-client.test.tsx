// @vitest-environment jsdom

import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ChatClient from '../../apps/web/src/app/chat/ChatClient';

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
  recordLearningSession: vi.fn(async () => null)
}));

vi.mock('../../apps/web/src/lib/useAppAuth', () => ({
  useAppAuth: () => useAppAuthMock()
}));

afterEach(() => {
  cleanup();
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
    recordLearningSession: vi.fn(async () => null)
  });
});

describe('chat ui', () => {
  it('shows a login-required modal for guests', () => {
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
      recordLearningSession: vi.fn(async () => null)
    });

    render(<ChatClient />);

    expect(screen.getByRole('dialog').textContent).toContain('로그인이 필요합니다.');
  });

  it('submits a message and renders the returned conversation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [
          {
            userId: 'demo-user',
            role: 'user',
            message: 'I go station yesterday',
            createdAt: '2026-03-26T00:00:00.000Z'
          },
          {
            userId: 'demo-user',
            role: 'assistant',
            message:
              'A more natural sentence is: I went to the station yesterday.',
            createdAt: '2026-03-26T00:00:00.000Z'
          },
          {
            userId: 'demo-user',
            role: 'correction',
            message: 'I went to the station yesterday.',
            corrected: 'I went to the station yesterday.',
            feedback: '과거 시제와 정관사를 보완하세요.',
            createdAt: '2026-03-26T00:00:00.000Z'
          }
        ]
      })
    } as Response);

    render(<ChatClient />);

    fireEvent.change(screen.getByLabelText('메시지 입력'), {
      target: { value: 'I go station yesterday' }
    });
    fireEvent.click(screen.getByRole('button', { name: '메시지 보내기' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'A more natural sentence is: I went to the station yesterday.'
        )
      ).toBeTruthy();
    });
  });

  it('renders the correction and feedback panel from the api response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        messages: [
          {
            userId: 'demo-user',
            role: 'user',
            message: 'I am go airport tomorrow',
            createdAt: '2026-03-26T00:00:00.000Z'
          },
          {
            userId: 'demo-user',
            role: 'assistant',
            message: 'Try: I am going to the airport tomorrow.',
            createdAt: '2026-03-26T00:00:00.000Z'
          },
          {
            userId: 'demo-user',
            role: 'correction',
            message: 'I am going to the airport tomorrow.',
            corrected: 'I am going to the airport tomorrow.',
            feedback: '현재진행형과 정관사를 함께 쓰면 더 자연스럽습니다.',
            createdAt: '2026-03-26T00:00:00.000Z'
          }
        ]
      })
    } as Response);

    render(<ChatClient />);

    fireEvent.change(screen.getByLabelText('메시지 입력'), {
      target: { value: 'I am go airport tomorrow' }
    });
    fireEvent.submit(
      screen.getByRole('button', { name: '메시지 보내기' }).closest('form')!
    );

    await waitFor(() => {
      expect(
        screen.getAllByText('I am going to the airport tomorrow.').length
      ).toBeGreaterThan(1);
      expect(
        screen.getByText('현재진행형과 정관사를 함께 쓰면 더 자연스럽습니다.')
      ).toBeTruthy();
    });
  });

  it('shows an error message when the api request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'AI 채팅 응답 생성에 실패했습니다.'
      })
    } as Response);

    render(<ChatClient />);

    fireEvent.change(screen.getByLabelText('메시지 입력'), {
      target: { value: 'Help me with this sentence' }
    });
    fireEvent.click(screen.getByRole('button', { name: '메시지 보내기' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'AI 채팅 요청 처리에 실패했습니다.'
      );
    });
  });
});
