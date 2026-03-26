# Nano Banana 이미지 생성 가이드

이 문서는 WordFlow의 고양이 타마고치 화면을 위해 Nano Banana 계열 이미지 생성 모델로 만들어야 하는 자산 목록, 파일명 규칙, 프롬프트, 로직 매핑 기준을 정리한다. 목적은 디자이너 없이도 일관된 고양이 캐릭터 이미지를 순차적으로 생성하고, 프론트엔드가 파일명 규칙만으로 화면 상태를 안전하게 매핑할 수 있게 만드는 것이다.

## 1. 생성 목표

- 홈 대시보드 대표 고양이 카드
- 고양이 상세 화면 전신 일러스트
- 성장 단계별 기본 건강 상태 이미지
- 돌봄 액션 피드백 이미지
- 향후 상태 이상 이미지 확장 기반

## 2. 기본 캐릭터 고정 설정

모든 프롬프트는 아래 고정값을 공유해야 한다.

- 캐릭터: 크림색 털, 둥근 얼굴, 짧은 다리, 호박색 눈, 작은 파란 목걸이
- 분위기: 귀엽고 따뜻한 모바일 게임풍, 공포 표현 금지
- 스타일: 2D casual mobile game illustration, soft shading, clean silhouette
- 배경: 노트/학습 세계관과 연결된 실내 공간
- 출력 원칙: 텍스트 없음, 워터마크 없음, UI 없음, 투명 배경 또는 여백 확보

## 3. 생성해야 할 성장 단계 이미지

이번 기준으로 기본 성장 단계 이미지는 6장을 우선 생성한다.

1. `kitten`
2. `junior`
3. `adult`
4. `middleAge`
5. `senior`
6. `veteran`

`legacy`는 1년 보상용 확장 이미지로 별도 생성한다.

## 4. 파일명 규칙

### 4.1 성장 단계 기본 이미지

- `kitten-base.png`
- `junior-healthy.png`
- `adult-healthy.png`
- `middle-age-healthy.png`
- `senior-healthy.png`
- `veteran-healthy.png`
- `legacy-healthy.png`

### 4.2 상태 이상 이미지

- `{stage}-hungry.png`
- `{stage}-smelly.png`
- `{stage}-stressed.png`
- `{stage}-sick.png`
- `{stage}-critical.png`
- `{stage}-dead.png`

현재 MVP에서는 최소한 `kitten` 전 단계 상태 이상 세트와 `junior` 이상의 `healthy` 세트를 우선 준비한다.

### 4.3 돌봄 액션 피드백 이미지

- `action-feed.png`
- `action-play.png`
- `action-wash.png`

필요 시 성장 단계별 액션 버전으로 확장한다.

- `{stage}-action-feed.png`
- `{stage}-action-play.png`
- `{stage}-action-wash.png`

## 5. 로직 매핑 규칙

프론트엔드 로직은 아래 우선순위로 이미지를 선택한다.

### 5.1 기본 표시 로직

- `kitten + healthy`는 `kitten-base.png` 사용
- 그 외 `healthy`는 `{stage}-healthy.png` 사용
- 상태 이상은 `{stage}-{status}.png` 우선 사용
- 해당 파일이 없으면 단계 fallback
- `veteran -> senior -> middle-age -> adult -> junior -> kitten`
- 최종 fallback은 `kitten-base.png`

### 5.2 돌봄 액션 연출 로직

- 먹이주기 직후 1~2초: `action-feed.png`
- 놀아주기 직후 1~2초: `action-play.png`
- 씻기기 직후 1~2초: `action-wash.png`
- 액션 연출 종료 후 현재 상태 이미지로 복귀

### 5.3 성장 단계 전환 로직

- `0~29일`: `kitten`
- `30~89일`: `junior`
- `90~149일`: `adult`
- `150~209일`: `middleAge`
- `210~279일`: `senior`
- `280~364일`: `veteran`
- `365일 이상`: `legacy`

프론트엔드 노출용 파일명은 kebab-case를 사용한다.

- `middleAge` -> `middle-age`

## 6. 프롬프트 템플릿

아래 템플릿을 기준으로 stage, mood, pose, scene만 교체해서 사용한다.

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored cat with a round face, short legs, amber eyes, and a tiny blue collar.
Stage: {stage}
Mood: {mood}
Pose: {pose}
Scene: {scene}
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

## 7. 성장 단계별 프롬프트

### 7.1 kitten

파일명: `kitten-base.png`

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored kitten with a round face, short legs, amber eyes, and a tiny blue collar.
Stage: kitten
Mood: innocent, curious, newly adopted.
Pose: standing with tiny paws close together, looking up gently.
Scene: cozy study desk corner with vocabulary cards and warm daylight.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 7.2 junior

파일명: `junior-healthy.png`

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored young cat with a round face, short legs, amber eyes, and a tiny blue collar.
Stage: junior
Mood: playful, bright, energetic.
Pose: front-facing with tail slightly raised and a lively stance.
Scene: study room with flashcards, notebook paper textures, and soft sunlight.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 7.3 adult

파일명: `adult-healthy.png`

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored adult cat with a round face, balanced proportions, amber eyes, and a tiny blue collar.
Stage: adult
Mood: healthy, dependable, calm.
Pose: stable standing pose with confident posture.
Scene: organized study desk with stacked word cards and tidy warm interior.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 7.4 middleAge

파일명: `middle-age-healthy.png`

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored middle-aged cat with a round face, slightly fuller body, amber eyes, and a tiny blue collar.
Stage: middleAge
Mood: composed, experienced, warm.
Pose: relaxed upright pose with gentle confidence.
Scene: notebook-themed study room with more mature and cozy atmosphere.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 7.5 senior

파일명: `senior-healthy.png`

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored senior cat with a round face, dignified body shape, amber eyes, and a tiny blue collar.
Stage: senior
Mood: wise, gentle, peaceful.
Pose: calm seated or softly standing pose with elegant presence.
Scene: quiet study nook with soft paper textures and evening lamp light.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 7.6 veteran

파일명: `veteran-healthy.png`

```text
Create a 2D mobile game pet character illustration for a language-learning tamagotchi app.
Character: a cream-colored veteran cat with a round face, reliable silhouette, amber eyes, and a tiny blue collar.
Stage: veteran
Mood: accomplished, proud, deeply bonded with the player.
Pose: confident hero-like standing pose without becoming aggressive.
Scene: rich study corner with completed vocabulary cards and achievement feeling.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

### 7.7 legacy 보상 이미지

파일명: `legacy-healthy.png`

```text
Create a special 2D mobile game pet character illustration for a language-learning tamagotchi reward screen.
Character: the same cream-colored cat with round face, amber eyes, and a tiny blue collar, now in its legacy stage.
Mood: rare, celebratory, prestigious, but still warm and cute.
Pose: proud full-body pose with subtle reward aura and sparkling accents.
Scene: premium notebook-themed study room celebrating one year of growth.
Style: polished casual mobile game art, soft shading, readable silhouette, warm notebook-inspired atmosphere.
Composition: full body centered, enough empty margin for UI crop, no text, no watermark, no interface overlay.
```

## 8. 돌봄 액션 이미지 프롬프트

### 8.1 밥주기

파일명: `action-feed.png`

```text
Create a 2D mobile game pet care action illustration.
Character: the same cream-colored cat with round face, amber eyes, and a tiny blue collar.
Action: happily eating from a food bowl after being fed.
Mood: relieved, satisfied, cute.
Scene: study room corner with a neat feeding mat and soft notebook-like background.
Style: polished casual mobile game art, soft shading, readable silhouette.
Composition: centered action shot for quick UI feedback, no text, no watermark, no interface overlay.
```

### 8.2 놀아주기

파일명: `action-play.png`

```text
Create a 2D mobile game pet care action illustration.
Character: the same cream-colored cat with round face, amber eyes, and a tiny blue collar.
Action: excitedly playing with a yarn toy.
Mood: joyful, energetic, affectionate.
Scene: study room floor with soft stationery props and playful motion feeling.
Style: polished casual mobile game art, soft shading, readable silhouette.
Composition: centered action shot for quick UI feedback, no text, no watermark, no interface overlay.
```

### 8.3 씻기기

파일명: `action-wash.png`

```text
Create a 2D mobile game pet care action illustration.
Character: the same cream-colored cat with round face, amber eyes, and a tiny blue collar.
Action: being gently washed and becoming clean, with soft soap bubbles.
Mood: refreshed, safe, cute.
Scene: cozy wash area that still matches a notebook-themed study world.
Style: polished casual mobile game art, soft shading, readable silhouette.
Composition: centered action shot for quick UI feedback, no text, no watermark, no interface overlay.
```

## 9. 구현용 체크리스트

- [ ] `apps/web/public/images/cats` 파일명과 로직 매핑 일치
- [ ] `middleAge`를 `middle-age`로 변환하는 헬퍼 추가
- [ ] `legacy-healthy.png` fallback 경로 추가
- [ ] 액션 연출용 `action-feed.png`, `action-play.png`, `action-wash.png` 표시 로직 추가
- [ ] 상태 이상 이미지가 없는 단계에 대한 fallback 체인 구현
- [ ] 이미지 누락 시 `kitten-base.png` 최종 fallback 유지

## 10. 권장 다음 작업

1. `scripts/assets/` 아래에 프롬프트 txt 파일 자동 생성 스크립트 추가
2. `apps/web/public/images/cats` 기준 파일명 정규화
3. `CatCard`, `/cat` 상세 화면에 액션 연출 이미지 상태 추가
