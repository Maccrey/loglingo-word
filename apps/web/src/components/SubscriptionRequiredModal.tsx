'use client';

/**
 * SubscriptionRequiredModal.tsx
 *
 * 비구독자가 AI 채팅을 시도할 때 노출되는 구독 유도 모달.
 *
 * 정책 (PRD 4.9):
 *   - 닫기 버튼 없음 — 구독 또는 단발성 결제로만 진행 가능
 *   - "구독하러 가기" → /settings
 *   - "또는 $1로 1시간 이용하기" → chat.extend_1h 결제 플로우
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  /** $1 단발 결제 성공 시 호출 (채팅 창 활성화) */
  onPurchaseSuccess: () => void;
};

export function SubscriptionRequiredModal({ onPurchaseSuccess }: Props) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);

  function handleGoToSettings() {
    router.push('/settings');
  }

  async function handlePurchaseExtend() {
    setIsPurchasing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'chat.extend_1h' })
      });

      if (!response.ok) {
        throw new Error('결제 세션 생성 실패');
      }

      const data = await response.json() as { url?: string };

      if (data.url) {
        // Stripe Checkout 페이지로 이동
        window.location.href = data.url;
      } else {
        // 결제 완료 처리 (webhook에서 처리된 경우)
        onPurchaseSuccess();
      }
    } catch {
      alert('결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    // 블러 오버레이 — 닫기 버튼 없음 (어떤 클릭에도 닫히지 않음)
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
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #fdf6e3 0%, #fff8ee 100%)',
          borderRadius: '24px',
          padding: '2rem',
          maxWidth: '360px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          animation: 'slideUpModal 0.35s ease'
        }}
      >
        {/* 아이콘 */}
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✨</div>

        {/* 제목 */}
        <h2
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#3d2c00',
            marginBottom: '0.75rem'
          }}
        >
          프리미엄 구독이 필요합니다
        </h2>

        {/* 설명 */}
        <p
          style={{
            fontSize: '0.9rem',
            color: '#7a5c2e',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}
        >
          AI 이성친구와 대화하려면 프리미엄 구독이 필요해요.
          구독 중인 회원은 <strong>하루 30분</strong> 무료로 이용할 수 있어요.
        </p>

        {/* 구독 버튼 */}
        <button
          onClick={handleGoToSettings}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.85rem',
            marginBottom: '0.75rem',
            background: 'linear-gradient(135deg, #f7a34b, #e07b2f)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(224,123,47,0.4)'
          }}
        >
          구독하러 가기 →
        </button>

        {/* 구분선 */}
        <p
          style={{
            fontSize: '0.78rem',
            color: '#bfa98a',
            margin: '0.5rem 0'
          }}
        >
          또는
        </p>

        {/* 단발 결제 버튼 */}
        <button
          onClick={handlePurchaseExtend}
          disabled={isPurchasing}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem',
            background: isPurchasing ? '#e0d5c5' : '#fff3e0',
            color: '#c07020',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: '2px solid #f0c080',
            borderRadius: '14px',
            cursor: isPurchasing ? 'not-allowed' : 'pointer'
          }}
        >
          {isPurchasing ? '처리 중...' : '$1로 1시간 이용하기 💬'}
        </button>

        <p
          style={{
            fontSize: '0.72rem',
            color: '#bfa98a',
            marginTop: '0.75rem'
          }}
        >
          단발 결제는 구독 없이 오늘 1시간만 사용할 수 있어요.
        </p>
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
