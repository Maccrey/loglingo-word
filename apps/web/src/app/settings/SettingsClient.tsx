'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import {
  getPaymentProducts,
  resolveEntitlementsForProducts,
  type PaymentProductId,
  type UserEntitlement
} from '@wordflow/payment/catalog';
import { createDefaultSettings, updateSettings } from '@wordflow/core/settings';

import { resolveAppErrorMessage } from '../errors';
import { t, type AppLocale } from '../i18n';

const surfaceStyle: Record<string, string | number> = {
  minHeight: '100vh',
  padding: '32px 20px 56px',
  background: 'linear-gradient(180deg, #f4efe7 0%, #c9e7d4 18%, #173347 100%)',
  color: '#f7fbf8'
};

const shellStyle: Record<string, string | number> = {
  width: '100%',
  maxWidth: 920,
  margin: '0 auto',
  display: 'grid',
  gap: 24
};

const panelStyle: Record<string, string | number> = {
  borderRadius: 28,
  padding: 24,
  background: 'rgba(12, 20, 31, 0.76)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 24px 80px rgba(6, 10, 16, 0.28)'
};

const badgeStyle: Record<string, string | number> = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '8px 14px',
  background: 'rgba(183, 248, 219, 0.14)',
  color: '#b7f8db',
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
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
  const [purchasedProductIds, setPurchasedProductIds] = useState<
    PaymentProductId[]
  >([]);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const entitlements: UserEntitlement =
    resolveEntitlementsForProducts(purchasedProductIds);

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

  return (
    <main style={surfaceStyle}>
      <div style={shellStyle}>
        <section style={{ ...panelStyle, display: 'grid', gap: 14 }}>
          <div style={badgeStyle}>{t(locale, 'settings.title')}</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {t(locale, 'settings.heading')}
          </h1>
          <Link href="/" style={{ color: '#b7f8db' }}>
            {t(locale, 'common.action.back_home')}
          </Link>
        </section>

        <section style={{ ...panelStyle, display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span>{t(locale, 'settings.language')}</span>
            <select
              aria-label={t(locale, 'settings.language')}
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
            <span>{t(locale, 'settings.learning_language')}</span>
            <select
              aria-label={t(locale, 'settings.learning_language')}
              value={settings.learningLanguage}
              onChange={(event) =>
                setSettings((current) =>
                  updateSettings(
                    current,
                    { learningLanguage: event.target.value },
                    '2026-03-26T00:00:00.000Z'
                  )
                )
              }
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
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
                border: 0,
                padding: '12px 16px',
                background: settings.notificationsEnabled
                  ? '#b7f8db'
                  : '#ffb4a8',
                color: '#10211d',
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
          <div style={badgeStyle}>{t(locale, 'settings.billing')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {products.map((product) => (
              <article
                key={product.id}
                style={{
                  borderRadius: 20,
                  padding: '16px 18px',
                  background: 'rgba(255,255,255,0.05)',
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
                <p style={{ margin: 0, color: 'rgba(247, 251, 248, 0.8)' }}>
                  {product.description}
                </p>
                <button
                  type="button"
                  aria-label={`${t(locale, 'settings.buy_product')} ${product.id}`}
                  onClick={() => void startCheckout(product.id)}
                  style={{
                    width: 'fit-content',
                    borderRadius: 18,
                    border: 0,
                    padding: '12px 16px',
                    background: '#8ce7ff',
                    color: '#0f2231',
                    cursor: 'pointer'
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
            <p role="status" style={{ margin: 0, color: '#b7f8db' }}>
              {checkoutMessage}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
