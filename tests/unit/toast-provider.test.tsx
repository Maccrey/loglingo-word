// @vitest-environment jsdom

import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ToastProvider from '../../apps/web/src/app/components/ToastProvider';
import { notifyAppToast } from '../../apps/web/src/lib/toast';

describe('toast provider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders a toast from the global event bus and auto dismisses it', async () => {
    render(
      <ToastProvider>
        <div>content</div>
      </ToastProvider>
    );

    await act(async () => {
      notifyAppToast({
        title: '포인트 획득',
        message: '고양이 키우기 포인트 +50를 획득했어요.',
        durationMs: 1000
      });
    });

    expect(screen.getByText('포인트 획득')).toBeTruthy();
    expect(screen.getByText('고양이 키우기 포인트 +50를 획득했어요.')).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByText('고양이 키우기 포인트 +50를 획득했어요.')
    ).toBeNull();
  });
});
