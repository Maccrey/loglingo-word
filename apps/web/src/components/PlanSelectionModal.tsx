'use client';

import React from 'react';
import type { PaymentProduct, PaymentProductId } from '@wordflow/payment/catalog';

type Props = {
  monthlyProduct: PaymentProduct;
  yearlyProduct: PaymentProduct;
  onClose: () => void;
  onSelect: (productId: PaymentProductId) => void;
};

export function PlanSelectionModal({
  monthlyProduct,
  yearlyProduct,
  onClose,
  onSelect
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fdf6e3 0%, #fff8ee 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          animation: 'slideUpModal 0.35s ease',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#7a5c2e'
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌟</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3d2c00', marginBottom: '0.5rem' }}>
          어떤 플랜을 선택하시겠어요?
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#7a5c2e', lineHeight: 1.6, marginBottom: '2rem' }}>
          연간 플랜을 선택하시면 약 2달치 요금을 할인해 드려요!
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          <button
            onClick={() => onSelect(monthlyProduct.id)}
            style={{
              padding: '1.2rem',
              borderRadius: '16px',
              border: '2px solid #e0c8a0',
              background: '#fffcf6',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#f7a34b';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(247,163,75,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0c8a0';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <strong style={{ fontSize: '1.1rem', color: '#3d2c00' }}>1개월 (Monthly)</strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e07b2f' }}>
                {monthlyProduct.priceLabel}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9a7a50' }}>매월 자동 결제됩니다.</p>
          </button>

          <button
            onClick={() => onSelect(yearlyProduct.id)}
            style={{
              padding: '1.2rem',
              borderRadius: '16px',
              border: '2px solid #f7a34b',
              background: 'linear-gradient(135deg, #fffcf6 0%, #fff0dc 100%)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'all 0.2s',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(247,163,75,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#f7a34b',
                color: '#fff',
                padding: '4px 12px',
                borderBottomLeftRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              BEST VALUE
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '4px' }}>
              <strong style={{ fontSize: '1.1rem', color: '#3d2c00' }}>12개월 (Yearly)</strong>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e07b2f' }}>
                {yearlyProduct.priceLabel}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9a7a50' }}>1년에 한 번 자동 결제. 약 $10 절약!</p>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
