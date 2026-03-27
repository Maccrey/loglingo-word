// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

import { BackButton } from '../../apps/web/src/components/BackButton';

afterEach(() => {
  cleanup();
});

describe('BackButton', () => {
  it('renders a Korean home link by default', () => {
    render(<BackButton />);

    const link = screen.getByRole('link', { name: '홈으로 돌아가기' });
    expect(link.getAttribute('href')).toBe('/');
  });

  it('preserves locale in the English home link', () => {
    render(<BackButton locale="en" />);

    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link.getAttribute('href')).toBe('/?locale=en');
  });
});
