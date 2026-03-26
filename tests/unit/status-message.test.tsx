// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import StatusMessage from '../../apps/web/src/app/components/StatusMessage';

afterEach(() => {
  cleanup();
});

describe('status message', () => {
  it('renders a loading state with status semantics', () => {
    render(<StatusMessage tone="loading" message="불러오는 중..." />);

    expect(screen.getByRole('status').textContent).toContain('불러오는 중...');
  });

  it('renders a success state with status semantics', () => {
    render(<StatusMessage tone="success" message="저장되었습니다." />);

    expect(screen.getByRole('status').textContent).toContain('저장되었습니다.');
  });

  it('renders an error state with alert semantics', () => {
    render(<StatusMessage tone="error" message="오류가 발생했습니다." />);

    expect(screen.getByRole('alert').textContent).toContain(
      '오류가 발생했습니다.'
    );
  });
});
