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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('chat ui', () => {
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
