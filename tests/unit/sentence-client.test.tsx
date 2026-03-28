// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import SentenceClient from '../../apps/web/src/app/sentence/SentenceClient';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('sentence builder ui', () => {
  function setJapaneseN5() {
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
  }

  it('loads the jlpt n5 block-order game from stored settings', async () => {
    setJapaneseN5();

    render(<SentenceClient />);

    expect(await screen.findByText('학교 가기 싫은 날')).toBeTruthy();
    expect(screen.getByText('목표 문장: 나는 간다.')).toBeTruthy();
    expect(screen.getByText('3개 보기 중 다음에 올 블록을 고르세요.')).toBeTruthy();
    expect(screen.getByText('주어와 동사부터 고르세요.')).toBeTruthy();
    expect(screen.getByRole('button', { name: '私は' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '学校に' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '行きたいです。' })).toBeTruthy();
  });

  it('shows advice when a similar but wrong block is selected', async () => {
    const user = userEvent.setup();
    setJapaneseN5();

    render(<SentenceClient />);

    await screen.findByText('학교 가기 싫은 날');

    await user.click(screen.getByRole('button', { name: '学校に' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '学校に 블록은 이 문장에 맞지 않습니다.'
    );
    expect(screen.getByText('장소는 아직 아닙니다.')).toBeTruthy();
  });

  it('reveals the next correct choice set and moves to the next problem after completion', async () => {
    const user = userEvent.setup();
    setJapaneseN5();

    render(<SentenceClient />);

    await screen.findByText('학교 가기 싫은 날');

    await user.click(screen.getByRole('button', { name: '私は' }));
    expect(screen.getByRole('button', { name: '行きます。' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '学校に' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '行きたいです。' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '行きます。' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '1단계 문장을 완성했습니다.'
    );
    expect(screen.getByText('기본 문장 완성. 다음은 장소입니다.')).toBeTruthy();
    expect(screen.getByText('私は')).toBeTruthy();
    expect(screen.getByText('行きます。')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '다음 문제' }));

    await waitFor(() => {
      expect(
        screen.getByText((_, element) =>
          element?.textContent === '목표 문장: 나는 학교에 간다.'
        )
      ).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: '私は' })).toBeTruthy();
  });
});
