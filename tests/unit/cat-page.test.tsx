// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CatDetailScreen from '../../apps/web/src/app/cat/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('cat detail page', () => {
  it('renders the cat detail heading and action buttons', () => {
    render(<CatDetailScreen />);

    expect(screen.getByText('나비 상세 정보')).toBeTruthy();
    expect(
      screen.getByText(
        '나비가 안정적인 상태예요. 지금처럼 학습과 돌봄을 이어가면 됩니다.'
      )
    ).toBeTruthy();
    expect(screen.getByText('상태 게이지')).toBeTruthy();
    expect(screen.getByRole('button', { name: /밥주기/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /놀아주기/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /씻기기/ })).toBeTruthy();
  });

  it('shows the growth summary section', () => {
    render(<CatDetailScreen />);

    expect(screen.getByText('성장 기록')).toBeTruthy();
    expect(screen.getByText(/현재 단계:/)).toBeTruthy();
    expect(screen.getByText(/건강하게 키운 일수:/)).toBeTruthy();
  });

  it('shows the cat slot list with a locked reward slot', () => {
    render(<CatDetailScreen />);

    expect(screen.getByText('고양이 슬롯')).toBeTruthy();
    expect(screen.getByText('대표 고양이')).toBeTruthy();
    expect(screen.getByText('추가 슬롯')).toBeTruthy();
    expect(
      screen.getByText('1년 육성 보상으로 새끼 고양이를 해금하면 열립니다.')
    ).toBeTruthy();
  });
});
