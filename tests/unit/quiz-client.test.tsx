// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import QuizClient from '../../apps/web/src/app/quiz/QuizClient';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('quiz ui', () => {
  it('submits a correct multiple choice answer', async () => {
    const user = userEvent.setup();

    render(<QuizClient />);

    await user.click(screen.getByRole('button', { name: '안녕하세요' }));
    await user.click(screen.getByRole('button', { name: '객관식 제출' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '객관식 정답입니다.'
    );
  });

  it('shows typed-answer feedback after submission', async () => {
    const user = userEvent.setup();

    render(<QuizClient />);

    await user.type(screen.getByLabelText('주관식 정답'), 'hello');
    await user.click(screen.getByRole('button', { name: '주관식 제출' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '주관식 정답입니다.'
    );
    expect(screen.getByText('오타 거리 0 / 허용 1')).toBeTruthy();
  });

  it('shows error feedback for a wrong typed answer', async () => {
    const user = userEvent.setup();

    render(<QuizClient />);

    await user.type(screen.getByLabelText('주관식 정답'), 'pass');
    await user.click(screen.getByRole('button', { name: '주관식 제출' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '주관식 오답입니다.'
    );
  });
});
