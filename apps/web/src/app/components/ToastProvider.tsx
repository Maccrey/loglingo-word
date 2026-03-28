'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { APP_TOAST_EVENT, type AppToastPayload } from '../../lib/toast';

type ToastItem = Required<
  Pick<AppToastPayload, 'id' | 'message' | 'tone' | 'durationMs'>
> &
  Pick<AppToastPayload, 'title'>;

type ToastProviderProps = {
  children: React.ReactNode;
};

function toneStyles(tone: ToastItem['tone']) {
  if (tone === 'info') {
    return {
      background: 'var(--accent-blue)',
      color: 'var(--text-ink)'
    };
  }

  return {
    background: 'var(--accent-green)',
    color: '#245c3d'
  };
}

export default function ToastProvider(props: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<ToastItem>;
      const nextToast = customEvent.detail;

      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== nextToast.id));
      }, nextToast.durationMs);
    }

    window.addEventListener(APP_TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(APP_TOAST_EVENT, handleToast);
    };
  }, []);

  const toastStack = useMemo(
    () => (
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 10001,
          display: 'grid',
          gap: 10,
          maxWidth: 360
        }}
      >
        {toasts.map((toast) => {
          const styles = toneStyles(toast.tone);

          return (
            <div
              key={toast.id}
              role="status"
              style={{
                borderRadius: 18,
                border: '1px solid var(--border-pencil)',
                boxShadow: 'var(--shadow-paper)',
                background: styles.background,
                color: styles.color,
                padding: '14px 16px',
                display: 'grid',
                gap: 4
              }}
            >
              {toast.title ? (
                <strong style={{ fontSize: 14 }}>{toast.title}</strong>
              ) : null}
              <span style={{ lineHeight: 1.5 }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
    ),
    [toasts]
  );

  return (
    <>
      {props.children}
      {toastStack}
    </>
  );
}
