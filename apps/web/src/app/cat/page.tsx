'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCat } from '../../lib/useCat';
import { getCatImagePath } from '../../lib/catImage';

function getStatusSummary(status: string) {
  switch (status) {
    case 'healthy':
      return '나비가 안정적인 상태예요. 지금처럼 학습과 돌봄을 이어가면 됩니다.';
    case 'hungry':
      return '배가 고파요. 먹이를 주거나 학습으로 돌봄 포인트를 확보하세요.';
    case 'smelly':
      return '청결 상태가 나빠졌어요. 목욕이 필요한 시점입니다.';
    case 'stressed':
      return '스트레스가 쌓이고 있어요. 조금 놀아주면 바로 좋아집니다.';
    case 'sick':
      return '아픈 상태예요. 약을 먹여서 건강 상태로 회복시켜야 합니다.';
    case 'critical':
      return '위험 상태예요. 즉시 치료하지 않으면 더 악화될 수 있습니다.';
    case 'dead':
      return '현재 생존 상태가 아닙니다. 복구 정책이 필요합니다.';
    default:
      return '현재 상태를 다시 확인해주세요.';
  }
}

export default function CatDetailScreen() {
  const { cat, points, currentStatus, handleFeed, handleWash, handlePlay, handleHeal } = useCat();
  const [mounted, setMounted] = useState(false);
  const [actionOverlay, setActionOverlay] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !cat) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  const handleAction = (actionFn: () => boolean, overlayName: string) => {
    const success = actionFn();
    if (success) {
      setActionOverlay(overlayName);
      setTimeout(() => setActionOverlay(null), 2000);
    }
  };

  const now = Date.now();
  const MS_PER_HOUR = 60 * 60 * 1000;
  
  const hoursSinceFeed = (now - cat.lastFedAt) / MS_PER_HOUR;
  const hoursSinceWash = (now - cat.lastWashedAt) / MS_PER_HOUR;
  const hoursSincePlay = (now - cat.lastPlayedAt) / MS_PER_HOUR;

  const hungerPercent = Math.max(0, 100 - (hoursSinceFeed / 12) * 100);
  const cleanPercent = Math.max(0, 100 - (hoursSinceWash / 24) * 100);
  const stressPercent = Math.max(0, 100 - (hoursSincePlay / 24) * 100);
  const statusSummary = getStatusSummary(currentStatus);

  const currentImagePath = actionOverlay 
    ? getCatImagePath(cat.stage, `action-${actionOverlay}`)
    : getCatImagePath(cat.stage, currentStatus as string);

  return (
    <main style={{ padding: '32px 20px', maxWidth: 640, margin: '0 auto', color: 'var(--text-ink)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-faded)', fontSize: 24 }}>← Home</Link>
        <div style={{ background: 'var(--bg-surface)', padding: '6px 16px', borderRadius: 999, fontWeight: 700 }}>
          ⭐ {points} pt
        </div>
      </header>

      <section style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, margin: '0 0 8px' }}>{cat.name} 상세 정보</h1>
        <p style={{ color: 'var(--text-faded)', margin: 0 }}>현재 상태: {currentStatus.toUpperCase()}</p>
        <p style={{ color: 'var(--text-ink)', margin: '10px 0 0', lineHeight: 1.6 }}>
          {statusSummary}
        </p>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <img 
          src={currentImagePath} 
          alt="Cat Large View" 
          style={{ width: 300, height: 300, objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/cats/kitten-base.png';
          }}
        />
      </div>

      <section style={{ display: 'grid', gap: 20, background: 'var(--bg-paper)', padding: 24, borderRadius: 20, boxShadow: 'var(--shadow-card)' }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>상태 게이지</h2>
        
        <GaugeBar label="포만감 (Hunger)" percent={hungerPercent} color="var(--accent-orange)" />
        <GaugeBar label="청결도 (Cleanliness)" percent={cleanPercent} color="var(--accent-green)" />
        <GaugeBar label="행복도 (Stress)" percent={stressPercent} color="var(--accent-blue)" />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => handleAction(handleFeed, 'feed')} style={btnStyle('var(--accent-orange)')}>🐟 밥주기 (100pt)</button>
          <button onClick={() => handleAction(handlePlay, 'play')} style={btnStyle('var(--accent-blue)')}>🧶 놀아주기 (200pt)</button>
          <button onClick={() => handleAction(handleWash, 'wash')} style={btnStyle('var(--accent-green)')}>🛁 씻기기 (150pt)</button>
          {(currentStatus === 'sick' || currentStatus === 'critical') && (
            <button onClick={() => handleAction(handleHeal, 'heal')} style={btnStyle('var(--accent-pink)')}>💊 치료하기 (1000pt)</button>
          )}
        </div>
      </section>

      <section style={{ marginTop: 24, padding: 24, background: 'var(--bg-card)', borderRadius: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, marginBottom: 12 }}>성장 기록</h2>
        <p style={{ margin: '0 0 8px' }}>현재 단계: <strong>{cat.stage.toUpperCase()}</strong></p>
        <p style={{ margin: 0 }}>건강하게 키운 일수: <strong>{Math.floor(cat.activeDays)}일</strong></p>
      </section>
    </main>
  );
}

function GaugeBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
        <span>{label}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div style={{ height: 12, background: 'var(--border-pencil)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '10px 16px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontWeight: 700,
    cursor: 'pointer',
  };
}
