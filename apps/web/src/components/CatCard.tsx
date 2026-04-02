'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buildCatStateSnapshot, getCatThresholds, type Cat, type CatStatus, type EnvThresholds } from '@wordflow/shared/cat';
import { useCat } from '../lib/useCat';
import { getCatImagePath } from '../lib/catImage';
import { getDailyCareChecklist } from '../lib/careChecklist';

const careActionCosts = {
  feed: 100,
  play: 200,
  wash: 150,
  heal: 1000
} as const;

const careActionPalette = {
  feed: {
    default: 'var(--accent-orange)',
    emphasized: '#d97706'
  },
  play: {
    default: 'var(--accent-blue)',
    emphasized: '#1d4ed8'
  },
  wash: {
    default: 'var(--accent-green)',
    emphasized: '#15803d'
  },
  heal: {
    default: 'var(--accent-pink)',
    emphasized: '#be123c'
  }
} as const;

const MOCK_ENV: Partial<EnvThresholds> = {
  CAT_HUNGRY_HOURS: 12,
  CAT_SMELLY_HOURS: 24,
  CAT_STRESS_AFTER_PLAY_MISS_HOURS: 3,
  CAT_STRESS_WARNING_LIMIT_HOURS: 12,
  CAT_SICK_AFTER_NO_PLAY_HOURS: 15,
  CAT_SICK_AFTER_SMELLY_HOURS: 72,
  CAT_DEATH_AFTER_NO_FEED_DAYS: 7,
  CAT_STRESSED_HOURS: 24,
  CAT_SICK_HOURS: 48,
  CAT_CRITICAL_HOURS: 24,
  CAT_DEAD_DAYS: 3
};

function getRequiredCare(status: CatStatus) {
  switch (status) {
    case 'hungry':
      return { label: '밥주기', cost: careActionCosts.feed };
    case 'smelly':
      return { label: '씻기기', cost: careActionCosts.wash };
    case 'stressed':
      return { label: '놀아주기', cost: careActionCosts.play };
    case 'sick':
    case 'critical':
      return { label: '치료하기', cost: careActionCosts.heal };
    case 'dead':
      return { label: '복구 정책', cost: 0 };
    default:
      return null;
  }
}

function getRecommendedCareAction(
  cat: Cat,
  status: CatStatus,
  now: number,
  isStressWarning: boolean
): keyof typeof careActionCosts {
  const missingDailyCare = getDailyCareChecklist(cat, now).find((item) => !item.done);

  if (status === 'dead') {
    return 'feed';
  }

  if (status === 'sick' || status === 'critical') {
    return 'heal';
  }

  if (missingDailyCare) {
    return missingDailyCare.action;
  }

  if (isStressWarning) {
    return 'play';
  }

  switch (status) {
    case 'hungry':
      return 'feed';
    case 'smelly':
      return 'wash';
    case 'stressed':
      return 'play';
    case 'sick':
    case 'critical':
      return 'heal';
    default:
      return 'feed';
  }
}

type CatCardProps = {
  headerAccessory?: ReactNode;
};

export default function CatCard({ headerAccessory }: CatCardProps) {
  const {
    cat,
    points,
    currentStatus,
    handleFeed,
    handleWash,
    handlePlay,
    handleHeal,
    resetCat
  } = useCat();
  const [mounted, setMounted] = useState(false);
  const [actionOverlay, setActionOverlay] = useState<string | null>(null);
  const [displayImagePath, setDisplayImagePath] = useState('/images/cats/kitten-base.png');
  const [isImageVisible, setIsImageVisible] = useState(true);
  const overlayTimeoutRef = useRef<number | null>(null);
  const currentImagePath = cat
    ? actionOverlay
      ? getCatImagePath(cat.stage, `action-${actionOverlay}`)
      : getCatImagePath(cat.stage, currentStatus)
    : '/images/cats/kitten-base.png';
  const IMAGE_FADE_MS = 320;
  const ACTION_OVERLAY_MS = 3000;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      setDisplayImagePath(currentImagePath);
      return;
    }

    if (displayImagePath === currentImagePath) {
      return;
    }

    setIsImageVisible(false);

    const transitionTimeout = window.setTimeout(() => {
      setDisplayImagePath(currentImagePath);
      window.requestAnimationFrame(() => {
        setIsImageVisible(true);
      });
    }, IMAGE_FADE_MS);

    return () => {
      window.clearTimeout(transitionTimeout);
    };
  }, [currentImagePath, displayImagePath, mounted]);

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current !== null) {
        window.clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  if (!mounted || !cat) {
    return (
      <section style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-pencil)' }}>
        Loading Cat...
      </section>
    );
  }

  const handleAction = (actionFn: () => boolean, overlayName: string) => {
    const success = actionFn();
    if (success) {
      if (overlayTimeoutRef.current !== null) {
        window.clearTimeout(overlayTimeoutRef.current);
      }
      setActionOverlay(overlayName);
      overlayTimeoutRef.current = window.setTimeout(() => {
        setActionOverlay(null);
        overlayTimeoutRef.current = null;
      }, ACTION_OVERLAY_MS);
    }
  };

  const thresholds = getCatThresholds(MOCK_ENV);
  const now = Date.now();
  const snapshot = buildCatStateSnapshot(cat, now, thresholds);
  const dailyCareChecklist = getDailyCareChecklist(cat, now);
  const missingDailyCare = dailyCareChecklist.find((item) => !item.done);
  const requiredCare = getRequiredCare(snapshot.status);
  const recommendedCareAction = getRecommendedCareAction(
    cat,
    snapshot.status,
    now,
    snapshot.isStressWarning
  );
  const missingPoints = requiredCare
    ? Math.max(0, requiredCare.cost - points)
    : 0;

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

      {headerAccessory ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: 16 }}>
          {headerAccessory}
        </div>
      ) : null}

      <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 16, alignSelf: 'center' }}>
        <Image
          src={displayImagePath}
          alt={`${cat.stage} cat feeling ${snapshot.status}`}
          width={240}
          height={240}
          priority
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: 12,
            opacity: isImageVisible ? 1 : 0,
            transition: `opacity ${IMAGE_FADE_MS}ms ease`
          }}
          onError={() => {
            if (displayImagePath !== '/images/cats/kitten-base.png') {
              setDisplayImagePath('/images/cats/kitten-base.png');
            }
          }}
        />
        {/* Status Badge */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: -10,
          background: getStatusColor(snapshot.status),
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {snapshot.status.toUpperCase()}
        </div>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--text-faded)', lineHeight: 1.5 }}>
        {snapshot.status === 'dead'
          ? '지금 필요한 돌봄: 고양이 다시 키우기'
          : snapshot.status === 'sick' || snapshot.status === 'critical'
            ? '지금 필요한 돌봄: 치료하기'
            : snapshot.status === 'hungry'
              ? '지금 필요한 돌봄: 밥주기'
              : snapshot.status === 'smelly'
                ? '지금 필요한 돌봄: 씻기기'
                : snapshot.status === 'stressed'
                  ? '지금 필요한 돌봄: 놀아주기'
                  : snapshot.isStressWarning
                    ? '지금 필요한 돌봄: 놀아주기'
            : missingDailyCare
              ? `지금 필요한 돌봄: 오늘 할일 ${missingDailyCare.label}`
              : '지금 필요한 돌봄: 오늘 돌봄 완료'}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {dailyCareChecklist.map((item) => (
          <span
            key={item.action}
            style={{
              borderRadius: 999,
              padding: '6px 10px',
              background: item.done ? 'rgba(76, 175, 80, 0.16)' : 'rgba(255, 152, 0, 0.14)',
              border: item.done ? '1px solid rgba(76, 175, 80, 0.4)' : '1px solid rgba(255, 152, 0, 0.35)',
              color: 'var(--text-ink)',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            {item.done ? `오늘 완료: ${item.label}` : `오늘 할일: ${item.label}`}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {snapshot.status === 'dead' ? (
          <button onClick={resetCat} style={btnStyle(careActionPalette.heal, true)}>🐣 고양이 다시 키우기</button>
        ) : (
          <>
            <button onClick={() => handleAction(handleFeed, 'feed')} style={btnStyle(careActionPalette.feed, recommendedCareAction === 'feed')}>🐟 밥주기 (100pt)</button>
            <button onClick={() => handleAction(handlePlay, 'play')} style={btnStyle(careActionPalette.play, recommendedCareAction === 'play')}>🧶 놀아주기 (200pt)</button>
            <button onClick={() => handleAction(handleWash, 'wash')} style={btnStyle(careActionPalette.wash, recommendedCareAction === 'wash')}>🛁 씻기기 (150pt)</button>
          </>
        )}
        {(snapshot.status === 'sick' || snapshot.status === 'critical') && snapshot.status !== 'dead' && (
          <button onClick={() => handleAction(handleHeal, 'medicine')} style={btnStyle(careActionPalette.heal, recommendedCareAction === 'heal')}>💊 치료하기 (1000pt)</button>
        )}
      </div>

      {snapshot.status === 'sick' || snapshot.status === 'critical' ? (
        <div
          style={{
            marginTop: 14,
            alignSelf: 'stretch',
            boxSizing: 'border-box',
            borderRadius: 14,
            padding: '12px 14px',
            background: 'rgba(244, 67, 54, 0.12)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: 'var(--text-ink)',
            lineHeight: 1.5,
            textAlign: 'center'
          }}
        >
          하루 동안 돌봄 방문이 없어서 치료가 필요해요. 치료하지 않은 채 3일이 더 지나면 고양이가 죽습니다.
        </div>
      ) : snapshot.isStressWarning ? (
        <div
          style={{
            marginTop: 14,
            alignSelf: 'stretch',
            boxSizing: 'border-box',
            borderRadius: 14,
            padding: '12px 14px',
            background: 'rgba(255, 213, 79, 0.18)',
            border: '1px solid var(--accent-yellow)',
            color: 'var(--text-ink)',
            lineHeight: 1.5,
            textAlign: 'center'
          }}
        >
          스트레스 경고 구간이에요. 학습 포인트가 있으면 먼저 놀아주는 편이 안전합니다.
        </div>
      ) : null}

      {requiredCare && missingPoints > 0 && requiredCare.cost > 0 ? (
        <div
          role="alert"
          style={{
            marginTop: 14,
            alignSelf: 'stretch',
            boxSizing: 'border-box',
            borderRadius: 14,
            padding: '12px 14px',
            background: 'var(--accent-yellow)',
            border: '1px solid var(--border-pencil)',
            display: 'grid',
            gap: 8,
            textAlign: 'center'
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-ink)', lineHeight: 1.5 }}>
            {requiredCare.label}에 필요한 돌봄 포인트가 {missingPoints}pt 부족해요. 바로 학습 시작으로 포인트를 모아보세요.
          </p>
          <Link
            href="/learn"
            style={{
              margin: '0 auto',
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
            단어 연습
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

function btnStyle(
  palette: { default: string; emphasized: string },
  emphasized = false
): React.CSSProperties {
  return {
    padding: '10px 16px',
    background: emphasized ? palette.emphasized : palette.default,
    color: '#fff',
    border: emphasized ? '2px solid rgba(255, 255, 255, 0.92)' : 'none',
    borderRadius: 12,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: emphasized
      ? '0 10px 20px rgba(15, 23, 42, 0.28)'
      : '0 2px 6px rgba(0,0,0,0.15)',
    transform: emphasized ? 'translateY(-1px)' : 'none',
    transition: 'transform 0.1s, box-shadow 0.1s, background 0.1s',
  };
}
