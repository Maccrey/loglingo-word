// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SettingsClient from '../../apps/web/src/app/settings/SettingsClient';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('settings ui', () => {
  it('renders the current settings values', () => {
    render(<SettingsClient />);

    expect(screen.getByRole('combobox', { name: '앱 언어' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: '학습 언어' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: '학습 레벨' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Google로 로그인' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '알림' }).textContent).toContain(
      '켜짐'
    );
  });

  it('shows the firebase auth preparation message when the google login button is clicked', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    await user.click(screen.getByRole('button', { name: 'Google로 로그인' }));

    expect(screen.getByRole('status').textContent).toContain(
      '구글 로그인은 Firebase Auth 연결 태스크 완료 후 활성화됩니다.'
    );
  });

  it('updates the learning level options when the learning language changes', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: '학습 언어' }),
      'ja'
    );

    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('JLPT N5');
  });

  it('toggles the notification setting', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    const toggle = screen.getByRole('button', { name: '알림' });
    await user.click(toggle);

    expect(toggle.textContent).toContain('꺼짐');
  });

  it('renders the payment product list', () => {
    render(<SettingsClient />);

    expect(screen.getByText('Premium Monthly')).toBeTruthy();
    expect(screen.getByText('Language Pack Plus')).toBeTruthy();
    expect(screen.getByText('AI Tutor Pro')).toBeTruthy();
  });

  it('starts checkout when a purchase button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        checkoutUrl: 'https://polar.sh/checkout/premium.monthly%3Ademo-user'
      })
    } as Response);

    render(<SettingsClient />);

    await user.click(
      screen.getByRole('button', { name: '상품 구매 premium.monthly' })
    );

    expect(screen.getByRole('status').textContent).toContain(
      '체크아웃 세션이 준비되었습니다.'
    );
  });

  it('shows updated entitlements after a purchase', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        checkoutUrl: 'https://polar.sh/checkout/ai_tutor.pro%3Ademo-user'
      })
    } as Response);

    render(<SettingsClient />);

    await user.click(
      screen.getByRole('button', { name: '상품 구매 ai_tutor.pro' })
    );

    expect(screen.getByText('AI 확장: 활성')).toBeTruthy();
    expect(screen.getByText('Premium Active')).toBeTruthy();
  });
});
