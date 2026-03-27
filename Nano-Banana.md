# Nano Banana 약먹기 이미지 프롬프트

이 문서는 WordFlow 고양이 타마고치의 `약먹기` 연출 이미지 생성용 프롬프트만 정리한다. 다른 성장/상태/액션 가이드는 제외하고, 각 성장 스테이지에서 동일한 캐릭터 연속성을 유지한 채 약을 먹는 장면을 생성하는 데 필요한 내용만 남긴다.

## 1. 공통 기준

- 캐릭터 고정값: 크림색 털, 둥근 얼굴, 짧은 다리, 호박색 눈, 작은 파란 목걸이
- 분위기: 아프지만 무섭지 않고, 보호받는 느낌이 드는 따뜻한 모바일 게임풍
- 스타일: 2D casual mobile game illustration, soft shading, clean silhouette
- 소품: 작은 약봉지 또는 알약 1개, 물그릇 또는 작은 컵
- 배경: 학습 세계관과 연결된 실내 돌봄 공간, 지나치게 복잡하지 않은 배경
- 출력 규칙: 텍스트 없음, 워터마크 없음, UI 없음, 전신 중심 구도, 모바일 크롭 여백 확보

## 2. 파일명 규칙

- `kitten-action-medicine.png`
- `junior-action-medicine.png`
- `adult-action-medicine.png`
- `middle-age-action-medicine.png`
- `senior-action-medicine.png`
- `veteran-action-medicine.png`

프론트엔드 stage 값이 `middleAge`여도 파일명은 `middle-age`를 사용한다.

## 3. 공통 템플릿

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored cat with a round face, short legs, amber eyes, and a tiny blue collar.
Stage: {stage}
Action: taking medicine safely with gentle owner care, small pill or pet medicine pouch nearby, small water bowl included.
Mood: recovering, protected, slightly weak but still cute and warm.
Scene: cozy study-themed care corner connected to a language learning room.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

## 4. 성장 단계별 프롬프트

### 4.1 kitten

파일명: `kitten-action-medicine.png`

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored kitten with a round face, short legs, amber eyes, and a tiny blue collar.
Stage: kitten
Action: taking medicine safely with tiny paws gathered close, a very small pill and a shallow water bowl nearby.
Mood: fragile, protected, recovering, still adorable.
Scene: cozy study desk corner turned into a tiny pet care spot with soft notebook textures and warm daylight.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 4.2 junior

파일명: `junior-action-medicine.png`

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored junior cat with a round face, short legs, amber eyes, and a tiny blue collar.
Stage: junior
Action: taking medicine with a slightly uneasy expression, medicine pouch and water bowl placed neatly beside the cat.
Mood: recovering, reassured, youthful and cute.
Scene: bright study room corner with flashcards, notebook paper textures, and a small pet care mat.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 4.3 adult

파일명: `adult-action-medicine.png`

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored adult cat with a round face, balanced proportions, amber eyes, and a tiny blue collar.
Stage: adult
Action: calmly taking medicine while sitting upright, with a small glass dish and water bowl beside it.
Mood: tired but cooperative, stable, recovering.
Scene: organized study desk area with vocabulary cards, soft lamp light, and a clean care corner.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 4.4 middleAge

파일명: `middle-age-action-medicine.png`

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored middle-aged cat with a round face, slightly fuller body, amber eyes, and a tiny blue collar.
Stage: middleAge
Action: taking medicine carefully in a calm seated pose, with a neatly prepared medicine packet and water bowl nearby.
Mood: mature, slightly weak, comforted, recovering safely.
Scene: cozy notebook-themed study room with warm paper textures and a thoughtful care atmosphere.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 4.5 senior

파일명: `senior-action-medicine.png`

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored senior cat with a round face, dignified body shape, amber eyes, and a tiny blue collar.
Stage: senior
Action: gently taking medicine with calm patience, water bowl and folded medicine pouch placed beside the cat.
Mood: wise, gentle, being cared for, slowly recovering.
Scene: quiet study nook with warm lamp light, soft stationery details, and a peaceful care setting.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 4.6 veteran

파일명: `veteran-action-medicine.png`

```text
Create a 2D mobile game pet care action illustration for a language-learning tamagotchi app.
Character: a cream-colored veteran cat with a round face, reliable silhouette, amber eyes, and a tiny blue collar.
Stage: veteran
Action: taking medicine in a composed, experienced posture, with a carefully arranged medicine tray and water bowl nearby.
Mood: enduring, trusted, protected, recovering with dignity.
Scene: rich study corner with completed vocabulary cards, warm indoor light, and a premium but cozy care atmosphere.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```
