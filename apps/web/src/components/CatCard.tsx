'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCat } from '../lib/useCat';
import { getCatImagePath } from '../lib/catImage';

const careActionCosts = {
  feed: 100,
  play: 200,
  wash: 150,
  heal: 1000
} as const;

export default function CatCard() {
  const { cat, points, currentStatus, handleFeed, handleWash, handlePlay, handleHeal } = useCat();
  const [mounted, setMounted] = useState(false);
  const [actionOverlay, setActionOverlay] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !cat) {
    return (
      <section style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-pencil)' }}>
        Loading Cat...
      </section>
    );
  }

  // Handle action overlays for 2 seconds
  const handleAction = (actionFn: () => boolean, overlayName: string) => {
    const success = actionFn();
    if (success) {
      setActionOverlay(overlayName);
      setTimeout(() => setActionOverlay(null), 2000);
    }
  };

  const currentImagePath = actionOverlay 
    ? getCatImagePath(cat.stage, `action-${actionOverlay}`)
    : getCatImagePath(cat.stage, currentStatus as string);
  const minimumCareCost =
    currentStatus === 'sick' || currentStatus === 'critical'
      ? Math.min(
          careActionCosts.feed,
          careActionCosts.play,
          careActionCosts.wash,
          careActionCosts.heal
        )
      : Math.min(careActionCosts.feed, careActionCosts.play, careActionCosts.wash);
  const missingPoints = Math.max(0, minimumCareCost - points);

  return (
    <section 
      className="cat-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px 20px',
        background: 'var(--bg-paper)',
        borderRadius: 20,
        border: '2px solid var(--accent-pink)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 20
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 16, gap: 12 }}>
        <Link href="/cat" style={{ textDecoration: 'none' }}>
          <h2 style={{ margin: 0, color: 'var(--text-ink)', fontSize: 24 }}>{cat.name} ↗</h2>
        </Link>
        <div style={{ background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>
          ⭐ {points} pt
        </div>
      </div>

      <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 16, alignSelf: 'center' }}>
        <img 
          src={currentImagePath} 
          alt={`${cat.stage} cat feeling ${currentStatus}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
          onError={(e) => {
            // Fallback back to kitten-base if image is missing
            (e.target as HTMLImageElement).src = '/images/cats/kitten-base.png';
          }}
        />
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: -10,
          background: getStatusColor(currentStatus),
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {currentStatus.toUpperCase()}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <button onClick={handleFeed} style={btnStyle('var(--accent-orange)')}>🐟 밥주기 (100pt)</button>
        <button onClick={handlePlay} style={btnStyle('var(--accent-blue)')}>🧶 놀아주기 (200pt)</button>
        <button onClick={handleWash} style={btnStyle('var(--accent-green)')}>🛁 씻기기 (150pt)</button>
        {(currentStatus === 'sick' || currentStatus === 'critical') && (
          <button onClick={handleHeal} style={btnStyle('var(--accent-pink)')}>💊 치료하기 (1000pt)</button>
        )}
      </div>

      {missingPoints > 0 ? (
        <div
          role="alert"
          style={{
            marginTop: 14,
            width: '100%',
            borderRadius: 14,
            padding: '12px 14px',
            background: 'var(--accent-yellow)',
            border: '1px solid var(--border-pencil)',
            display: 'grid',
            gap: 8
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-ink)', lineHeight: 1.5 }}>
            돌봄 포인트가 {missingPoints}pt 부족해요. 바로 학습 시작으로 포인트를 모아보세요.
          </p>
          <Link
            href="/learn"
            style={{
              width: 'fit-content',
              borderRadius: 999,
              padding: '8px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-pencil)',
              color: 'var(--text-ink)',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            바로 시작
          </Link>
        </div>
      ) : null}
      
      <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--text-faded)' }}>
        성장 단계: {cat.stage.toUpperCase()} | 생존 일수: {Math.floor(cat.activeDays)}일
      </p>
    </section>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'healthy': return '#4caf50';
    case 'hungry': return '#ff9800';
    case 'smelly': return '#795548';
    case 'stressed': return '#9c27b0';
    case 'sick': return '#f44336';
    case 'critical': return '#b71c1c';
    case 'dead': return '#212121';
    default: return '#757575';
  }
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
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    transition: 'transform 0.1s',
  };
}
