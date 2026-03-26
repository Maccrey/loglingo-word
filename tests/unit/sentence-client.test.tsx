// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import SentenceClient from '../../apps/web/src/app/sentence/SentenceClient';

afterEach(() => {
  cleanup();
});

describe('sentence builder ui', () => {
  it('moves tokens into the assembled sentence area', async () => {
    const user = userEvent.setup();

    render(<SentenceClient />);

    await user.click(screen.getByRole('button', { name: 'Please' }));

    const assembledSection = screen.getByText('조합 영역').closest('section');
    expect(assembledSection?.textContent).toContain('Please');
  });

  it('shows a success result after submitting the correct sentence', async () => {
    const user = userEvent.setup();

    render(<SentenceClient />);

    for (const token of ['Please', 'show', 'me', 'your', 'passport']) {
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

    await user.click(screen.getByRole('button', { name: 'Please' }));
    await user.click(screen.getByRole('button', { name: 'passport' }));
    await user.click(screen.getByRole('button', { name: '문장 제출' }));

    expect(screen.getByRole('alert').textContent).toContain(
      '문장 순서를 다시 확인하세요.'
    );
  });
});
