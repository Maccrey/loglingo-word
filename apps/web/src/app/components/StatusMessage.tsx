import React from 'react';

export type StatusTone = 'loading' | 'success' | 'error';

type StatusMessageProps = {
  tone: StatusTone;
  message: string;
};

function getStatusStyles(tone: StatusTone): {
  color: string;
  borderColor: string;
  background: string;
} {
  if (tone === 'success') {
    return {
      color: '#2d7a4d',
      borderColor: 'var(--border-pencil)',
      background: 'var(--accent-green)'
    };
  }

  if (tone === 'error') {
    return {
      color: '#d32f2f',
      borderColor: 'var(--border-pencil)',
      background: 'var(--accent-pink)'
    };
  }

  return {
    color: 'var(--text-ink)',
    borderColor: 'var(--border-pencil)',
    background: 'var(--accent-yellow)'
  };
}

export default function StatusMessage(props: StatusMessageProps) {
  const styles = getStatusStyles(props.tone);

  return (
    <p
      role={props.tone === 'error' ? 'alert' : 'status'}
      style={{
        margin: 0,
        padding: '12px 14px',
        borderRadius: 16,
        border: `1px solid ${styles.borderColor}`,
        background: styles.background,
        color: styles.color,
        lineHeight: 1.6
      }}
    >
      {props.message}
    </p>
  );
}
