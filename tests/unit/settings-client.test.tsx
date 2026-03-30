// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

const signInWithGooglePopupMock = vi.fn();
const signOutMock = vi.fn(async () => undefined);
const hasFirebaseWebConfigMock = vi.fn(() => true);
const initializeFirebaseAnalyticsMock = vi.fn(async () => null);
const useAppAuthMock = vi.fn(() => ({
  status: 'authenticated',
  userId: 'demo-user',
  displayName: '테스트 사용자',
  email: 'tester@example.com',
  needsTermsConsent: false,
  authReady: true,
  isAuthenticated: true,
  isGuest: false,
  signIn: signInWithGooglePopupMock,
  signOut: signOutMock,
  acceptTerms: vi.fn(),
  saveLearningState: vi.fn(async () => true),
  recordLearningSession: vi.fn(async () => null)
}));

vi.mock('../../apps/web/src/lib/firebase-client', () => ({
  initializeFirebaseAnalytics: () => initializeFirebaseAnalyticsMock(),
  signInWithGooglePopup: () => signInWithGooglePopupMock(),
  hasFirebaseWebConfig: () => hasFirebaseWebConfigMock()
}));

vi.mock('../../apps/web/src/lib/useAppAuth', () => ({
  useAppAuth: () => useAppAuthMock()
}));

import SettingsClient from '../../apps/web/src/app/settings/SettingsClient';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
  signInWithGooglePopupMock.mockReset();
  signOutMock.mockReset();
  hasFirebaseWebConfigMock.mockReset();
  hasFirebaseWebConfigMock.mockReturnValue(true);
  initializeFirebaseAnalyticsMock.mockReset();
  initializeFirebaseAnalyticsMock.mockResolvedValue(null);
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
    signIn: signInWithGooglePopupMock,
    signOut: signOutMock,
    acceptTerms: vi.fn(),
    saveLearningState: vi.fn(async () => true),
    recordLearningSession: vi.fn(async () => null)
  });
});

describe('settings ui', () => {
  it('renders the current settings values', () => {
    render(<SettingsClient />);

    expect(screen.getByRole('combobox', { name: '앱 언어' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: '학습 언어' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: '학습 레벨' })).toBeTruthy();
    expect(
      screen.getByRole('combobox', { name: '한 번에 학습할 문제 수' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '로그아웃' })
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: '알림' }).textContent).toContain(
      '켜짐'
    );
  });

  it('shows a login-required modal when the user is not authenticated', () => {
    useAppAuthMock.mockReturnValue({
      status: 'guest',
      userId: 'demo-user',
      displayName: null,
      email: null,
      needsTermsConsent: false,
      authReady: true,
      isAuthenticated: false,
      isGuest: true,
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => false),
      recordLearningSession: vi.fn(async () => null)
    });

    render(<SettingsClient />);

    expect(screen.getByRole('dialog').textContent).toContain(
      '로그인이 필요합니다.'
    );
  });

  it('updates the user after a successful google sign-in', async () => {
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
      signIn: signInWithGooglePopupMock,
      signOut: signOutMock,
      acceptTerms: vi.fn(),
      saveLearningState: vi.fn(async () => false),
      recordLearningSession: vi.fn(async () => null)
    });
    signInWithGooglePopupMock.mockResolvedValue({
      user: {
        uid: 'firebase-user-1',
        displayName: '테스트 사용자',
        email: 'tester@example.com'
      }
    });

    render(<SettingsClient />);

    await user.click(screen.getAllByRole('button', { name: 'Google로 로그인' })[1]);

    expect(screen.getByRole('status').textContent).toContain(
      '구글 로그인 완료: 테스트 사용자'
    );
  });

  it('shows a sign-out button and signs out when already authenticated', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    await user.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(signOutMock).toHaveBeenCalledTimes(1);
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

  it('shows the phrasal verb track when english is selected', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: '학습 언어' }),
      'en'
    );

    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('Phrasal Verbs 300');
  });

  it('shows added app languages and language-specific level systems', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    expect(screen.getAllByRole('option', { name: 'Japanese' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option', { name: 'Chinese' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('option', { name: 'German' }).length).toBeGreaterThan(0);

    await user.selectOptions(
      screen.getByRole('combobox', { name: '학습 언어' }),
      'de'
    );

    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('CEFR A1');
    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('CEFR C2');

    await user.selectOptions(
      screen.getByRole('combobox', { name: '학습 언어' }),
      'ko'
    );

    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('TOPIK 1');
    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('TOPIK 6');

    await user.selectOptions(
      screen.getByRole('combobox', { name: '학습 언어' }),
      'zh'
    );

    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('HSK 1');
    expect(
      screen.getByRole('combobox', { name: '학습 레벨' }).textContent
    ).toContain('HSK 6');
  });

  it('updates the per-session question count', async () => {
    const user = userEvent.setup();

    render(<SettingsClient />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: '한 번에 학습할 문제 수' }),
      '10'
    );

    expect(
      (
        screen.getByRole('combobox', {
          name: '한 번에 학습할 문제 수'
        }) as HTMLSelectElement
      ).value
    ).toBe('10');
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
