'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CollapsiblePageHeader } from '../../components/CollapsiblePageHeader';

import type { AIChatMessage } from '@wordflow/ai/chat';

import StatusMessage from '../components/StatusMessage';
import { resolveAppErrorMessage } from '../errors';
import { t, type AppLocale } from '../i18n';
import { useAppAuth } from '../../lib/useAppAuth';
import { AuthRequiredModal } from '../../components/AuthRequiredModal';
import { TermsConsentModal } from '../../components/TermsConsentModal';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'transparent',
  color: 'var(--text-ink)'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gap: 32
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 16,
  padding: 32,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-pencil)',
  boxShadow: 'var(--shadow-card)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '6px 12px',
  background: 'var(--accent-yellow)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
};

const panelBadgeStyle: Record<string, string | number> = {
  ...badgeStyle,
  height: 32,
  alignItems: 'center'
};

type ChatClientProps = {
  locale?: AppLocale;
};

function labelForRole(
  locale: AppLocale,
  role: AIChatMessage['role'],
  userDisplayName?: string | null
): string {
  if (role === 'assistant') {
    return t(locale, 'chat.role.assistant');
  }

  if (role === 'correction') {
    return t(locale, 'chat.role.correction');
  }

  return userDisplayName?.trim() || t(locale, 'chat.role.user');
}

export default function ChatClient(props: ChatClientProps) {
  const locale = props.locale ?? 'ko';
  const auth = useAppAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const latestCorrection =
    [...messages].reverse().find((message) => message.role === 'correction') ??
    null;
  const conversationMessages = messages.filter(
    (message) => message.role !== 'correction'
  );

  useEffect(() => {
    const container = conversationScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }, [conversationMessages, loading]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  function handleConversationScroll() {
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      const container = conversationScrollRef.current;

      if (!container) {
        return;
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      scrollTimeoutRef.current = null;
    }, 1000);
  }

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
          userId: auth.userId,
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

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!draft.trim() || loading) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  }

  return (
    <main style={surfaceStyle}>
      {auth.isGuest ? (
        <AuthRequiredModal locale={locale} onLogin={() => void auth.signIn()} />
      ) : null}
      {auth.isAuthenticated && auth.needsTermsConsent ? (
        <TermsConsentModal locale={locale} onAccept={() => void auth.acceptTerms()} />
      ) : null}
      <div style={shellStyle}>
        <CollapsiblePageHeader locale={locale}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={badgeStyle}>{t(locale, 'chat.title')}</div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t(locale, 'chat.heading')}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: 640,
                lineHeight: 1.6,
                color: 'var(--text-faded)'
              }}
            >
              {t(locale, 'chat.description')}
            </p>
          </div>
        </CollapsiblePageHeader>

        <div
          style={{
            display: 'grid',
            gap: 20,
            alignItems: 'stretch',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 1fr)'
          }}
        >
          <section
            data-testid="chat-conversation-panel"
            style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '72vh' }}
          >
            <div style={panelBadgeStyle}>{t(locale, 'chat.conversation')}</div>
            <div
              ref={conversationScrollRef}
              onScroll={handleConversationScroll}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                scrollbarGutter: 'stable',
                boxSizing: 'border-box',
                paddingLeft: 14,
                paddingRight: 22
              }}
            >
              {conversationMessages.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                  {t(locale, 'chat.empty')}
                </p>
              ) : (
                conversationMessages.map((message, index) => {
                  const isUserMessage = message.role === 'user';
                  const bubbleBackground =
                    isUserMessage
                      ? 'var(--accent-blue)'
                      : message.role === 'assistant'
                        ? 'var(--accent-yellow)'
                        : 'var(--accent-green)';

                  return (
                    <div
                      key={`${message.role}-${index}-${message.createdAt}`}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                        paddingBottom: 10
                      }}
                    >
                      <article
                        style={{
                          position: 'relative',
                          width: '70%',
                          maxWidth: 560,
                          marginLeft: isUserMessage ? 'auto' : 0,
                          marginRight: isUserMessage ? 0 : 'auto',
                          borderRadius: 18,
                          padding: '10px 16px',
                          minHeight: 30,
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'visible',
                          border: '1px solid var(--border-pencil)',
                          boxShadow: '0 3px 8px rgba(44,42,37,0.08)',
                          background: bubbleBackground
                        }}
                      >
                        {/* 말풍선 꼬리 — 카카오톡 스타일: 옆방향 하단 배치 */}
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            /* 사용자(파랑): 오른쪽 밖 하단 / 튜터(노랑): 왼쪽 밖 하단 */
                            left: isUserMessage ? 'auto' : -12,
                            right: isUserMessage ? -12 : 'auto',
                            bottom: 10,
                            width: 0,
                            height: 0,
                            /* 사용자: ▶ (border-left에 색상), 튜터: ◀ (border-right에 색상) */
                            borderTop: '7px solid transparent',
                            borderBottom: '7px solid transparent',
                            borderLeft: isUserMessage
                              ? `12px solid ${bubbleBackground}`
                              : 'none',
                            borderRight: isUserMessage
                              ? 'none'
                              : `12px solid ${bubbleBackground}`,
                            zIndex: 2
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            minHeight: 0
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 6px',
                              borderRadius: 999,
                              background: 'rgba(255,255,255,0.35)',
                              fontSize: 10,
                              lineHeight: 1,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--text-faded)',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            {labelForRole(locale, message.role, auth.displayName)}
                          </span>
                          <p
                            style={{
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              minHeight: 0,
                              flex: 1,
                              lineHeight: 1.2,
                              textAlign: 'left'
                            }}
                          >
                            {message.message}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={submitMessage}
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                alignItems: 'end',
                flexShrink: 0
              }}
            >
              <label style={{ display: 'grid', gap: 8 }}>
                <span>{t(locale, 'chat.input_label')}</span>
                <textarea
                  aria-label={t(locale, 'chat.input_label')}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  placeholder={t(locale, 'chat.placeholder')}
                  rows={4}
                  style={{
                    borderRadius: 16,
                    border: '1px solid var(--border-pencil)',
                    padding: '14px 16px',
                    background: 'transparent',
                    color: 'var(--text-ink)',
                    resize: 'vertical',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                />
              </label>
              <button
                type="submit"
                aria-label="SEND"
                disabled={loading}
                style={{
                  width: 'fit-content',
                  height: 84,
                  border: '1px solid var(--btn-primary-border)',
                  borderRadius: 999,
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 700,
                  background: loading
                    ? 'var(--btn-disabled-bg)'
                    : 'var(--btn-primary-bg)',
                  color: loading ? 'var(--btn-disabled-color)' : '#fff',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                {loading ? t(locale, 'common.status.loading') : 'SEND'}
              </button>
            </form>

          </section>

          <section
            style={{
              ...panelStyle,
              display: 'grid',
              gap: 12,
              minHeight: '72vh',
              alignContent: 'start',
              overflowY: 'auto'
            }}
          >
            <div style={panelBadgeStyle}>{t(locale, 'chat.correction')}</div>
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
              <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                {t(locale, 'chat.correction_empty')}
              </p>
            )}

            {error ? <StatusMessage tone="error" message={error} /> : null}
          </section>
        </div>
      </div>
    </main>
  );
}
