'use client';

import React, { useEffect, useState } from 'react';
import { type AppLocale } from '../app/i18n';

import { BackButton } from './BackButton';

type CollapsiblePageHeaderProps = {
  locale: AppLocale;
  children: React.ReactNode;
  expandedMinHeight?: number;
  collapsedMinHeight?: number;
  showElapsedTime?: boolean;
};

export function CollapsiblePageHeader(props: CollapsiblePageHeaderProps) {
  const {
    locale,
    children,
    expandedMinHeight = 180,
    collapsedMinHeight = 36,
    showElapsedTime = true
  } = props;
  const [collapsed, setCollapsed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCollapsed(true);
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!showElapsedTime) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [showElapsedTime]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = elapsedSeconds % 60;
  const elapsedLabel =
    locale === 'en'
      ? `Study Time ${String(elapsedMinutes).padStart(2, '0')}:${String(
          remainingSeconds
        ).padStart(2, '0')}`
      : `학습시간 ${String(elapsedMinutes).padStart(2, '0')}:${String(
          remainingSeconds
        ).padStart(2, '0')}`;

  return (
    <section
      style={{
        borderRadius: 16,
        padding: collapsed ? '6px 12px' : '28px 32px',
        minHeight: collapsed ? collapsedMinHeight : expandedMinHeight,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-pencil)',
        boxShadow: 'var(--shadow-card)',
        display: 'grid',
        gap: collapsed ? 0 : 16,
        transition: 'padding 0.45s ease, gap 0.45s ease, min-height 0.45s ease'
      }}
    >
      <div
        style={{
          overflow: 'hidden',
          maxHeight: collapsed ? 0 : 320,
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? 'translateY(-10px)' : 'translateY(0)',
          transition:
            'max-height 0.55s ease, opacity 0.4s ease, transform 0.4s ease'
        }}
      >
        {children}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          minHeight: collapsed ? 22 : 0
        }}
      >
        <BackButton locale={locale} compact={collapsed} />
        <span
          style={{
            color: 'var(--text-faded)',
            fontSize: collapsed ? 12 : 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            opacity: collapsed && showElapsedTime ? 1 : 0,
            visibility: showElapsedTime ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease'
          }}
        >
          {showElapsedTime ? elapsedLabel : ''}
        </span>
      </div>
    </section>
  );
}
