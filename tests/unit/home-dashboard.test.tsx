// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import HomeDashboard from '../../apps/web/src/app/HomeDashboard';

afterEach(() => {
  cleanup();
});

describe('home dashboard', () => {
  it('renders the main summary cards', () => {
    render(<HomeDashboard />);

    expect(screen.getAllByText('오늘 할 학습').length).toBeGreaterThan(0);
    expect(screen.getAllByText('연속 학습 streak').length).toBeGreaterThan(0);
    expect(screen.getAllByText('누적 포인트').length).toBeGreaterThan(0);
  });

  it('renders a quick start link to the study flow', () => {
    render(<HomeDashboard />);

    const quickStart = screen.getByRole('link', { name: '바로 시작' });
    expect(quickStart.getAttribute('href')).toBe('/learn');
  });

  it('shows the loading state when dashboard data is pending', () => {
    render(<HomeDashboard loading />);

    expect(screen.getByText('대시보드 데이터를 불러오는 중...')).toBeTruthy();
  });

  it('switches text when the locale changes', () => {
    render(<HomeDashboard locale="en" />);

    expect(screen.getAllByText("Today's Learning Flow").length).toBeGreaterThan(
      0
    );
    expect(screen.getByRole('link', { name: 'Quick Start' })).toBeTruthy();
  });
});
