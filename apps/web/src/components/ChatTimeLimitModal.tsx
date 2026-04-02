'use client';

/**
 * ChatTimeLimitModal.tsx
 *
 * 하루 채팅 시간(구독자 30분 / 비구독자 구매한 시간)을 모두 소진했을 때 노출되는 모달.
 *
 * 정책 (PRD 4.9):
 *   - "내일 또 만나요 💕" 제목
 *   - "1시간 연장하기" 버튼 → chat.extend_1h 결제 → allowedMinutes +60
 *   - 결제 완료 후 모달 닫힘 + 대화 재개
 *   - 소프트 푸시업 애니메이션
 */

import { useState } from 'react';
import Link from 'next/link';

type Props = {
  /** 오늘 사용한 총 시간(분) — 안내 메시지 표시용 */
  usedMinutes: number;
  /** 1시간 연장 결제 성공 시 호출 */
  onExtendSuccess: () => void;
};

export function ChatTimeLimitModal({ usedMinutes, onExtendSuccess }: Props) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  async function handleExtend() {
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
        window.location.href = data.url;
      } else {
        onExtendSuccess();
      }
    } catch {
      alert('결제를 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '1.5rem'
      }}
    >
      {/* 중앙 카드 */}
      <div
        style={{
          background: 'linear-gradient(160deg, #fff0f6 0%, #fde8d8 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'popInModal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >


        {/* 이모지 */}
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>💕</div>

        {/* 제목 */}
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#8b2252',
            marginBottom: '0.5rem'
          }}
        >
          내일 또 만나요
        </h2>

        {/* 설명 */}
        <p
          style={{
            fontSize: '0.9rem',
            color: '#b05080',
            lineHeight: 1.6,
            marginBottom: '1.75rem'
          }}
        >
          오늘 <strong>{usedMinutes}분</strong> 대화를 모두 사용했어요.
          <br />
          내일 다시 만나거나, 지금 1시간 연장할 수 있어요.
        </p>

        {/* 1시간 연장 버튼 */}
        <button
          id="chat-extend-btn"
          onClick={handleExtend}
          disabled={isPurchasing}
          style={{
            display: 'block',
            width: '100%',
            padding: '1rem',
            background: isPurchasing
              ? '#ddb8c8'
              : 'linear-gradient(135deg, #f472b6, #ec4899)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.05rem',
            border: 'none',
            borderRadius: '16px',
            cursor: isPurchasing ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(236,72,153,0.4)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (!isPurchasing) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          {isPurchasing ? '처리 중...' : '💬 1시간 연장하기 ($1)'}
        </button>

        {/* 홈으로 가기 버튼 */}
        <Link
          href="/"
          style={{
            display: 'block',
            marginTop: '1rem',
            padding: '0.875rem',
            color: '#b05080',
            fontWeight: 600,
            fontSize: '0.95rem',
            textDecoration: 'none',
            border: '1px solid #f9dbe8',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.4)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255, 255, 255, 0.8)';
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#f472b6';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255, 255, 255, 0.4)';
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#f9dbe8';
          }}
        >
          🏠 홈으로 돌아가기
        </Link>

        <p
          style={{
            fontSize: '0.72rem',
            color: '#c890a8',
            marginTop: '0.75rem'
          }}
        >
          연장은 무제한 반복 가능해요.
        </p>
      </div>

      <style>{`
        @keyframes popInModal {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
