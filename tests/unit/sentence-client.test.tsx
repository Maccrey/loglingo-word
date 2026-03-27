// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import SentenceClient from '../../apps/web/src/app/sentence/SentenceClient';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('sentence builder ui', () => {
  it('moves tokens into the assembled sentence area', async () => {
    const user = userEvent.setup();

    render(<SentenceClient />);

    await user.click(screen.getByRole('button', { name: 'Hello' }));

    const assembledSection = screen.getByText('조합 영역').closest('section');
    expect(assembledSection?.textContent).toContain('Hello');
  });

  it('shows a success result after submitting the correct sentence', async () => {
    const user = userEvent.setup();

    render(<SentenceClient />);

    for (const token of ['Hello', 'nice', 'to', 'meet', 'you']) {
      await user.click(screen.getByRole('button', { name: token }));
    }

    await user.click(screen.getByRole('button', { name: '문장 제출' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '문장 완성 정답입니다.'
    );
  });

  it('shows error feedback when submitted with missing tokens', async () => {
    const user = userEvent.setup();

    render(<SentenceClient />);

    await user.click(screen.getByRole('button', { name: 'Hello' }));
    await user.click(screen.getByRole('button', { name: 'you' }));
    await user.click(screen.getByRole('button', { name: '문장 제출' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '문장 순서를 다시 확인하세요.'
    );
  });
});
