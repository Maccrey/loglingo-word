'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { buildCatStateSnapshot, getCatThresholds, type EnvThresholds } from '@wordflow/shared/cat';
import { BackButton } from '../../components/BackButton';
import { resolveLocale } from '../i18n';
import { useCat } from '../../lib/useCat';
import { getCatImagePath } from '../../lib/catImage';

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

function getStatusSummary(name: string, status: string, isStressWarning: boolean) {
  if (status === 'stressed' && isStressWarning) {
    return '스트레스 경고 구간이에요. 12시간을 넘긴 상태라 빠르게 놀아주는 편이 안전합니다.';
  }

  switch (status) {
    case 'healthy':
      return `${name}가 안정적인 상태예요. 지금처럼 학습과 돌봄을 이어가면 됩니다.`;
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

function getTimelineText(hours: number, warningHours: number, riskHours?: number) {
  if (riskHours !== undefined && hours >= riskHours) {
    return `${Math.floor(hours)}시간 경과, 위험 구간`;
  }

  if (hours >= warningHours) {
    return `${Math.floor(hours)}시간 경과, 경고 구간`;
  }

  return `${Math.floor(hours)}시간 경과, 안정 구간`;
}

function buildCatSlots(cat: { id: string; name: string; stage: string }) {
  return [
    {
      id: cat.id,
      label: '대표 고양이',
      name: cat.name,
      stage: cat.stage,
      unlocked: true,
      requirement: null
    },
    {
      id: 'locked-slot-2',
      label: '추가 슬롯',
      name: '잠금됨',
      stage: null,
      unlocked: false,
      requirement: '1년 육성 보상으로 새끼 고양이를 해금하면 열립니다.'
    }
  ];
}

export default function CatDetailScreen() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get('locale') ?? undefined);
  const { cat, points, currentStatus, handleFeed, handleWash, handlePlay, handleHeal } = useCat();
  const [mounted, setMounted] = useState(false);
  const [actionOverlay, setActionOverlay] = useState<string | null>(null);
  const [displayImagePath, setDisplayImagePath] = useState('/images/cats/kitten-base.png');
  const currentImagePath = cat
    ? actionOverlay
      ? getCatImagePath(cat.stage, `action-${actionOverlay}`)
      : getCatImagePath(cat.stage, currentStatus)
    : '/images/cats/kitten-base.png';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDisplayImagePath(currentImagePath);
  }, [currentImagePath]);

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
  const thresholds = getCatThresholds(MOCK_ENV);
  
  const hoursSinceFeed = (now - cat.lastFedAt) / MS_PER_HOUR;
  const hoursSinceWash = (now - cat.lastWashedAt) / MS_PER_HOUR;
  const hoursSincePlay = (now - cat.lastPlayedAt) / MS_PER_HOUR;
  const snapshot = buildCatStateSnapshot(cat, now, thresholds);

  const hungerPercent = Math.max(0, 100 - (hoursSinceFeed / thresholds.CAT_HUNGRY_HOURS) * 100);
  const cleanPercent = Math.max(0, 100 - (hoursSinceWash / thresholds.CAT_SMELLY_HOURS) * 100);
  const stressPercent = Math.max(
    0,
    100 - (hoursSincePlay / thresholds.CAT_SICK_AFTER_NO_PLAY_HOURS) * 100
  );
  const statusSummary = getStatusSummary(cat.name, snapshot.status, snapshot.isStressWarning);
  const catSlots = buildCatSlots(cat);

  return (
    <main style={{ padding: '32px 20px', maxWidth: 640, margin: '0 auto', color: 'var(--text-ink)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <BackButton locale={locale} />
        <div style={{ background: 'var(--bg-surface)', padding: '6px 16px', borderRadius: 999, fontWeight: 700 }}>
          ⭐ {points} pt
        </div>
      </header>

      <section style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, margin: '0 0 8px' }}>{cat.name} 상세 정보</h1>
        <p style={{ color: 'var(--text-faded)', margin: 0 }}>현재 상태: {snapshot.status.toUpperCase()}</p>
        <p style={{ color: 'var(--text-ink)', margin: '10px 0 0', lineHeight: 1.6 }}>
          {statusSummary}
        </p>
      </section>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <Image
          src={displayImagePath}
          alt="Cat Large View"
          width={300}
          height={300}
          style={{ width: 300, height: 300, objectFit: 'contain' }}
          onError={() => {
            if (displayImagePath !== '/images/cats/kitten-base.png') {
              setDisplayImagePath('/images/cats/kitten-base.png');
            }
          }}
        />
      </div>

      <section style={{ display: 'grid', gap: 20, background: 'var(--bg-paper)', padding: 24, borderRadius: 20, boxShadow: 'var(--shadow-card)' }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>상태 게이지</h2>
        
        <GaugeBar label="포만감 (Hunger)" percent={hungerPercent} color="var(--accent-orange)" />
        <GaugeBar label="청결도 (Cleanliness)" percent={cleanPercent} color="var(--accent-green)" />
        <GaugeBar label="행복도 (Stress)" percent={stressPercent} color="var(--accent-blue)" />

        <div
          style={{
            display: 'grid',
            gap: 10,
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
          }}
        >
          <TimelineCard
            title="급식 타이머"
            body={getTimelineText(hoursSinceFeed, thresholds.CAT_HUNGRY_HOURS, thresholds.CAT_DEATH_AFTER_NO_FEED_DAYS * 24)}
            accent="var(--accent-orange)"
          />
          <TimelineCard
            title="청결 타이머"
            body={getTimelineText(hoursSinceWash, thresholds.CAT_SMELLY_HOURS, thresholds.CAT_SICK_AFTER_SMELLY_HOURS)}
            accent="var(--accent-green)"
          />
          <TimelineCard
            title="놀이 타이머"
            body={getTimelineText(hoursSincePlay, thresholds.CAT_STRESS_AFTER_PLAY_MISS_HOURS, thresholds.CAT_SICK_AFTER_NO_PLAY_HOURS)}
            accent="var(--accent-blue)"
          />
        </div>

        {snapshot.isStressWarning ? (
          <div
            role="alert"
            style={{
              borderRadius: 16,
              padding: '14px 16px',
              background: 'rgba(255, 213, 79, 0.18)',
              border: '1px solid var(--accent-yellow)',
              color: 'var(--text-ink)'
            }}
          >
            스트레스 경고: 마지막으로 놀아준 지 {Math.floor(hoursSincePlay)}시간이 지났어요. 15시간 전에 놀아주면 아프지 않게 유지할 수 있습니다.
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => handleAction(handleFeed, 'feed')} style={btnStyle('var(--accent-orange)')}>🐟 밥주기 (100pt)</button>
          <button onClick={() => handleAction(handlePlay, 'play')} style={btnStyle('var(--accent-blue)')}>🧶 놀아주기 (200pt)</button>
          <button onClick={() => handleAction(handleWash, 'wash')} style={btnStyle('var(--accent-green)')}>🛁 씻기기 (150pt)</button>
          {(snapshot.status === 'sick' || snapshot.status === 'critical') && (
            <button onClick={() => handleAction(handleHeal, 'medicine')} style={btnStyle('var(--accent-pink)')}>💊 치료하기 (1000pt)</button>
          )}
        </div>
      </section>

      <section style={{ marginTop: 24, padding: 24, background: 'var(--bg-card)', borderRadius: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, marginBottom: 12 }}>성장 기록</h2>
        <p style={{ margin: '0 0 8px' }}>현재 단계: <strong>{cat.stage.toUpperCase()}</strong></p>
        <p style={{ margin: 0 }}>건강하게 키운 일수: <strong>{Math.floor(cat.activeDays)}일</strong></p>
      </section>

      <section
        style={{
          marginTop: 24,
          padding: 24,
          background: 'var(--bg-paper)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gap: 14
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20 }}>고양이 슬롯</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {catSlots.map((slot) => (
            <article
              key={slot.id}
              style={{
                borderRadius: 16,
                padding: '14px 16px',
                background: slot.unlocked ? 'var(--bg-card)' : 'rgba(255,255,255,0.5)',
                border: '1px solid var(--border-pencil)',
                display: 'grid',
                gap: 6
              }}
            >
              <strong>{slot.label}</strong>
              <span>{slot.name}</span>
              {slot.stage ? <span>단계: {slot.stage.toUpperCase()}</span> : null}
              {!slot.unlocked && slot.requirement ? (
                <span style={{ color: 'var(--text-faded)' }}>{slot.requirement}</span>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function TimelineCard({ title, body, accent }: { title: string; body: string; accent: string }) {
  return (
    <article
      style={{
        borderRadius: 16,
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: `1px solid ${accent}`,
        display: 'grid',
        gap: 6
      }}
    >
      <strong>{title}</strong>
      <span style={{ color: 'var(--text-faded)', lineHeight: 1.5 }}>{body}</span>
    </article>
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
