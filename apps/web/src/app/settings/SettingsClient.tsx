'use client';

import React, { useEffect, useState } from 'react';

import {
  getPaymentProducts,
  resolveEntitlementsForProducts,
  type PaymentProductId,
  type UserEntitlement
} from '@wordflow/payment/catalog';
import { createDefaultSettings, updateSettings } from '@wordflow/core/settings';
import {
  getDefaultLearningLevel,
  learningLevelOptionsByLanguage,
  type SupportedLearningLanguage
} from '@wordflow/shared/learning-preferences';

import { resolveAppErrorMessage } from '../errors';
import { t, type AppLocale } from '../i18n';
import { BackButton } from '../../components/BackButton';
import {
  loadStoredSettings,
  saveStoredSettings
} from '../../lib/settingsStorage';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'transparent',
  color: 'var(--text-ink)'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 920,
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
  background: 'var(--accent-green)',
  color: 'var(--text-ink)',
  border: '1px dashed var(--border-pencil)',
  fontSize: 13,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600
};

const fieldLabelStyle: Record<string, string | number> = {
  fontSize: 17,
  fontWeight: 700,
  color: 'var(--text-ink)'
};

const fieldControlStyle: Record<string, string | number> = {
  minHeight: 52,
  borderRadius: 14,
  border: '1px solid var(--border-pencil)',
  background: 'rgba(255, 255, 255, 0.88)',
  color: 'var(--text-ink)',
  padding: '12px 16px',
  fontSize: 17,
  fontWeight: 600,
  lineHeight: 1.4,
  boxShadow: 'var(--shadow-card)'
};

type SettingsClientProps = {
  locale?: AppLocale;
};

export default function SettingsClient(props: SettingsClientProps) {
  const locale = props.locale ?? 'ko';
  const products = getPaymentProducts();
  const [settings, setSettings] = useState(() =>
    createDefaultSettings({
      userId: 'demo-user',
      learningLanguage: 'en',
      updatedAt: '2026-03-25T00:00:00.000Z'
    })
  );
  const [hydrated, setHydrated] = useState(false);
  const [purchasedProductIds, setPurchasedProductIds] = useState<
    PaymentProductId[]
  >([]);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const entitlements: UserEntitlement =
    resolveEntitlementsForProducts(purchasedProductIds);
  const learningLevelOptions =
    learningLevelOptionsByLanguage[settings.learningLanguage];

  useEffect(() => {
    const storedSettings = loadStoredSettings();
    if (storedSettings) {
      setSettings(storedSettings);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveStoredSettings(settings);
  }, [hydrated, settings]);

  async function startCheckout(productId: PaymentProductId) {
    const response = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId,
        userId: settings.userId,
        successUrl: 'https://wordflow.app/billing/success',
        cancelUrl: 'https://wordflow.app/billing/cancel'
      })
    });
    const payload = (await response.json()) as {
      checkoutUrl?: string;
      message?: string;
    };

    if (!response.ok || !payload.checkoutUrl) {
      setCheckoutMessage(
        payload.message
          ? resolveAppErrorMessage(new Error(payload.message))
          : t(locale, 'settings.checkout_error')
      );
      return;
    }

    setPurchasedProductIds((current) =>
      current.includes(productId) ? current : [...current, productId]
    );
    setSettings((current) =>
      updateSettings(
        current,
        { premiumEnabled: true },
        '2026-03-26T00:00:00.000Z'
      )
    );
    setCheckoutMessage(
      `${t(locale, 'settings.checkout_started')} ${payload.checkoutUrl}`
    );
  }

  function startGoogleLogin() {
    setAuthMessage(t(locale, 'settings.google_login_pending'));
  }

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'settings.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'settings.heading')}
          </h1>
          <BackButton locale={locale} />
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={fieldLabelStyle}>{t(locale, 'settings.language')}</span>
            <select
              aria-label={t(locale, 'settings.language')}
              style={fieldControlStyle}
              value={settings.appLanguage}
              onChange={(event) =>
                setSettings((current) =>
                  updateSettings(
                    current,
                    { appLanguage: event.target.value as 'ko' | 'en' },
                    '2026-03-26T00:00:00.000Z'
                  )
                )
              }
            >
              <option value="ko">Korean</option>
              <option value="en">English</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={fieldLabelStyle}>
              {t(locale, 'settings.learning_language')}
            </span>
            <select
              aria-label={t(locale, 'settings.learning_language')}
              style={fieldControlStyle}
              value={settings.learningLanguage}
              onChange={(event) =>
                setSettings((current) =>
                  updateSettings(
                    current,
                    {
                      learningLanguage:
                        event.target.value as SupportedLearningLanguage,
                      learningLevel: getDefaultLearningLevel(
                        event.target.value as SupportedLearningLanguage
                      )
                    },
                    '2026-03-26T00:00:00.000Z'
                  )
                )
              }
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={fieldLabelStyle}>
              {t(locale, 'settings.learning_level')}
            </span>
            <select
              aria-label={t(locale, 'settings.learning_level')}
              style={fieldControlStyle}
              value={settings.learningLevel}
              onChange={(event) =>
                setSettings((current) =>
                  updateSettings(
                    current,
                    {
                      learningLevel: event.target.value as typeof current.learningLevel
                    },
                    '2026-03-26T00:00:00.000Z'
                  )
                )
              }
            >
              {learningLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gap: 8 }}>
            <span>{t(locale, 'settings.notifications')}</span>
            <button
              type="button"
              aria-label={t(locale, 'settings.notifications')}
              onClick={() =>
                setSettings((current) =>
                  updateSettings(
                    current,
                    { notificationsEnabled: !current.notificationsEnabled },
                    '2026-03-26T00:00:00.000Z'
                  )
                )
              }
              style={{
                width: 'fit-content',
                borderRadius: 999,
                border: '1px solid var(--border-pencil)',
                padding: '12px 16px',
                background: settings.notificationsEnabled
                  ? 'var(--accent-green)'
                  : 'var(--accent-pink)',
                color: 'var(--text-ink)',
                cursor: 'pointer'
              }}
            >
              {settings.notificationsEnabled
                ? t(locale, 'settings.notifications_on')
                : t(locale, 'settings.notifications_off')}
            </button>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <span>{t(locale, 'settings.premium')}</span>
            <p style={{ margin: 0 }}>
              {settings.premiumEnabled
                ? t(locale, 'settings.subscription_active')
                : t(locale, 'settings.subscription_free')}
            </p>
          </div>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 16 }}>
          <div style={badgeStyle}>{t(locale, 'settings.account')}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <span>{t(locale, 'settings.google_login_label')}</span>
            <p style={{ margin: 0, color: 'var(--text-faded)' }}>
              {t(locale, 'settings.google_login_description')}
            </p>
            <button
              type="button"
              aria-label={t(locale, 'settings.google_login')}
              onClick={startGoogleLogin}
              style={{
                width: 'fit-content',
                border: '1px solid var(--border-pencil)',
                borderRadius: 999,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 700,
                background: '#fff',
                color: 'var(--text-ink)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              {t(locale, 'settings.google_login')}
            </button>
            {authMessage ? (
              <p role="status" style={{ margin: 0, color: '#2d7a4d' }}>
                {authMessage}
              </p>
            ) : null}
          </div>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 16 }}>
          <div style={badgeStyle}>{t(locale, 'settings.billing')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  borderRadius: 20,
                  padding: '16px 18px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-pencil)',
                  display: 'grid',
                  gap: 8
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap'
                  }}
                >
                  <strong>{product.name}</strong>
                  <span>{product.priceLabel}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-faded)' }}>
                  {product.description}
                </p>
                <button
                  type="button"
                  aria-label={`${t(locale, 'settings.buy_product')} ${product.id}`}
                  onClick={() => void startCheckout(product.id)}
                  style={{
                    width: 'fit-content',
                    border: '1px solid var(--btn-primary-border)',
                    borderRadius: 999,
                    padding: '12px 24px',
                    fontSize: 16,
                    fontWeight: 700,
                    background: 'var(--btn-primary-bg)',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  {t(locale, 'settings.premium_cta')}
                </button>
              </article>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <span>{t(locale, 'settings.entitlement_status')}</span>
            <p style={{ margin: 0 }}>
              {t(locale, 'settings.entitlement_ad_free')}:{' '}
              {entitlements.adFree
                ? t(locale, 'settings.status_enabled')
                : t(locale, 'settings.status_disabled')}
            </p>
            <p style={{ margin: 0 }}>
              {t(locale, 'settings.entitlement_ai')}:{' '}
              {entitlements.aiTutorExtended
                ? t(locale, 'settings.status_enabled')
                : t(locale, 'settings.status_disabled')}
            </p>
            <p style={{ margin: 0 }}>
              {t(locale, 'settings.entitlement_languages')}:{' '}
              {entitlements.unlockedLanguages.length > 0
                ? entitlements.unlockedLanguages.join(', ')
                : t(locale, 'settings.none')}
            </p>
          </div>

          {checkoutMessage ? (
            <p role="status" style={{ margin: 0, color: '#2d7a4d' }}>
              {checkoutMessage}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
