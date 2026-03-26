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
      color: '#dfffea',
      borderColor: 'rgba(183, 248, 219, 0.34)',
      background: 'rgba(183, 248, 219, 0.12)'
    };
  }

  if (tone === 'error') {
    return {
      color: '#ffd4cc',
      borderColor: 'rgba(255, 180, 168, 0.34)',
      background: 'rgba(255, 180, 168, 0.12)'
    };
  }

  return {
    color: '#ffe2b0',
    borderColor: 'rgba(255, 214, 153, 0.34)',
    background: 'rgba(255, 214, 153, 0.12)'
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
