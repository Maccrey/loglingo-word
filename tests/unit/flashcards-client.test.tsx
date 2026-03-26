// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import FlashcardsClient from '../../apps/web/src/app/learn/FlashcardsClient';

afterEach(() => {
  cleanup();
});

describe('flashcards ui', () => {
  it('renders the current word and flips to show its meaning', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    expect(screen.getByText('hello')).toBeTruthy();
    expect(screen.queryByText('안녕하세요')).toBeNull();

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));

    expect(screen.getByText('안녕하세요')).toBeTruthy();
    expect(screen.getByText('Hello, nice to meet you.')).toBeTruthy();
  });

  it('moves to the next card when a rating button is clicked', async () => {
    const user = userEvent.setup();

    render(<FlashcardsClient />);

    await user.click(screen.getByRole('button', { name: '카드 뒤집기' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));

    expect(screen.getByText('subway')).toBeTruthy();
    expect(screen.getByText('카드 2 / 4')).toBeTruthy();
  });
});
