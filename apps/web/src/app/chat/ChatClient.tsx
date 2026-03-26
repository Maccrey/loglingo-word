'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import type { AIChatMessage } from '@wordflow/ai/chat';

import StatusMessage from '../components/StatusMessage';
import { resolveAppErrorMessage } from '../errors';
import { t, type AppLocale } from '../i18n';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'linear-gradient(180deg, #f4efe7 0%, #ffd6bb 16%, #122f40 100%)',
  color: '#f7f4ef'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 24
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 28,
  padding: 24,
  background: 'rgba(12, 20, 31, 0.78)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 80px rgba(6, 10, 16, 0.28)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '8px 14px',
  background: 'rgba(255, 223, 187, 0.14)',
  color: '#ffd699',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

type ChatClientProps = {
  locale?: AppLocale;
};

function labelForRole(locale: AppLocale, role: AIChatMessage['role']): string {
  if (role === 'assistant') {
    return t(locale, 'chat.role.assistant');
  }

  if (role === 'correction') {
    return t(locale, 'chat.role.correction');
  }

  return t(locale, 'chat.role.user');
}

export default function ChatClient(props: ChatClientProps) {
  const locale = props.locale ?? 'ko';
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestCorrection =
    [...messages].reverse().find((message) => message.role === 'correction') ??
    null;

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.trim() || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'demo-user',
          nativeLanguage: locale,
          targetLanguage: 'en',
          userLevel: 'beginner',
          message: draft,
          createdAt: '2026-03-26T00:00:00.000Z',
          recentMessages: messages
        })
      });
      const payload = (await response.json()) as
        | { messages: AIChatMessage[] }
        | { message?: string };

      if (!response.ok || !('messages' in payload)) {
        throw new Error(
          'message' in payload && payload.message
            ? payload.message
            : t(locale, 'chat.error')
        );
      }

      setMessages((current) => [...current, ...payload.messages]);
      setDraft('');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? resolveAppErrorMessage(requestError)
          : t(locale, 'chat.error')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'chat.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'chat.heading')}
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 640,
              lineHeight: 1.6,
              color: 'rgba(247, 244, 239, 0.8)'
            }}
          >
            {t(locale, 'chat.description')}
          </p>
          <Link href="/" style={{ color: '#ffd699' }}>
            {t(locale, 'common.action.back_home')}
          </Link>
        </section>

        <section
          data-testid="chat-conversation-panel"
          style={{ ...panelStyle, display: 'grid', gap: 16 }}
        >
          <div style={badgeStyle}>{t(locale, 'chat.conversation')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {messages.length === 0 ? (
              <p style={{ margin: 0, color: 'rgba(247, 244, 239, 0.72)' }}>
                {t(locale, 'chat.empty')}
              </p>
            ) : (
              messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}-${message.createdAt}`}
                  style={{
                    borderRadius: 20,
                    padding: '14px 16px',
                    background:
                      message.role === 'user'
                        ? 'rgba(140, 231, 255, 0.14)'
                        : message.role === 'assistant'
                          ? 'rgba(255, 214, 153, 0.14)'
                          : 'rgba(183, 248, 219, 0.14)'
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(247, 244, 239, 0.7)',
                      marginBottom: 8
                    }}
                  >
                    {labelForRole(locale, message.role)}
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>
                    {message.message}
                  </p>
                </article>
              ))
            )}
          </div>

          <form onSubmit={submitMessage} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span>{t(locale, 'chat.input_label')}</span>
              <textarea
                aria-label={t(locale, 'chat.input_label')}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t(locale, 'chat.placeholder')}
                rows={4}
                style={{
                  borderRadius: 18,
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#f7f4ef',
                  resize: 'vertical'
                }}
              />
            </label>
            <button
              type="submit"
              aria-label={t(locale, 'chat.send')}
              disabled={loading}
              style={{
                width: 'fit-content',
                border: 0,
                borderRadius: 18,
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 700,
                background: loading ? 'rgba(255, 214, 153, 0.6)' : '#ffd699',
                color: '#2d1b0e',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading
                ? t(locale, 'common.status.loading')
                : t(locale, 'chat.send')}
            </button>
          </form>

          {loading ? (
            <StatusMessage
              tone="loading"
              message={t(locale, 'common.status.loading')}
            />
          ) : null}
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 12 }}>
          <div style={badgeStyle}>{t(locale, 'chat.correction')}</div>
          {latestCorrection ? (
            <>
              <div>
                <h2 style={{ margin: '0 0 8px' }}>
                  {t(locale, 'chat.corrected')}
                </h2>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  {latestCorrection.corrected ?? latestCorrection.message}
                </p>
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px' }}>
                  {t(locale, 'chat.feedback')}
                </h2>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  {latestCorrection.feedback}
                </p>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: 'rgba(247, 244, 239, 0.72)' }}>
              {t(locale, 'chat.correction_empty')}
            </p>
          )}

          {error ? <StatusMessage tone="error" message={error} /> : null}
        </section>
      </div>
    </main>
  );
}
