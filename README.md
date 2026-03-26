WordFlow

AI 기반 글로벌 언어 학습 플랫폼이다. 이 저장소의 현재 기획 핵심은 "학습으로 포인트를 벌고, 그 포인트로 고양이를 건강하게 키우는 언어 학습 타마고치"다.

## 주요 기능

- 단어, 복습, 문장, AI 대화 기반 언어 학습
- 학습 결과에 따른 포인트 적립
- 포인트를 사용한 고양이 돌봄
- 시간 경과 기반 배고픔, 냄새, 스트레스, 질병 상태 전이
- 장기 육성 보상으로 새끼 고양이 추가 획득

## 핵심 규칙 요약

- 기본 시작 캐릭터는 새끼 고양이 1마리다.
- 하루 15분 이상 학습하면 기본 돌봄에 필요한 포인트를 안정적으로 확보할 수 있어야 한다.
- 학습하지 않으면 12시간 후 배고픔 상태가 시작된다.
- 마지막 급식 후 7일이 지나면 고양이는 사망한다.
- 먹이를 준 뒤 24시간이 지나면 냄새 상태가 시작된다.
- 냄새 상태가 72시간 누적되면 아프다.
- 마지막으로 놀아준 뒤 3시간이 지나면 스트레스가 쌓이기 시작한다.
- 12시간까지는 버틸 수 있지만 15시간이 지나면 스트레스성 질병 위험이 발생한다.
- 약 또는 주사를 사용하면 질병 상태를 회복할 수 있다.
- 1년 누적 육성 보상 달성 시 새끼 고양이 1마리를 추가 지급한다.

## 권장 구조

- `apps/web`: Next.js UI
- `services/core`: 학습, 포인트, 고양이 상태 전이, 밸런스 규칙
- `services/ai`: AI 대화, 교정, 추천
- `services/payment`: 결제
- `packages/shared`: 타입, 상수, 스키마
- `tests/unit`: 순수 함수와 상태 전이 테스트
- `tests/integration`: API, 저장소, 화면 흐름 테스트
- `assets/prompts/nano-banana/cats`: 고양이 이미지 생성 프롬프트

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 현재 구현 상태

- 홈 대시보드에서 대표 고양이 카드와 `바로 학습 시작` 패널을 같은 행에 배치했다.
- 대표 고양이 카드는 이름, 포인트, 상태 배지, 돌봄 액션 버튼을 제공한다.
- `/cat` 상세 화면에서 상태 게이지와 성장 기록, 상태 요약 문구를 확인할 수 있다.
- 리더보드는 현재 포커스된 사용자 기준 공유 미리보기 문구와 링크 복사/외부 공유를 지원한다.
- 피드 카드는 공유 미리보기 문구와 Web Share API, 외부 공유 fallback 흐름을 지원한다.
- 현재 고양이 상태와 포인트 흐름은 `LocalStorage` 기반 mock 상태로 동작한다.

## 환경 변수 설계

운영자가 포인트 적립량과 돌봄 비용, 시간 기준을 쉽게 바꿀 수 있도록 `.env`로 제어한다. 실제 구현 시 아래 키를 사용하고, 코드에는 동일한 기본값을 fallback으로 둔다.

```env
# 기본 포인트 적립값
# DEFAULT: 5
POINTS_DAILY_LEARNING_START=5
# DEFAULT: 20
POINTS_DAILY_STUDY_15M=20
# DEFAULT: 2
POINTS_PER_MEMORIZED_WORD=2
# DEFAULT: 1
POINTS_PER_REVIEW_WORD=1
# DEFAULT: 3
POINTS_SENTENCE_COMPLETION=3
# DEFAULT: 5
POINTS_AI_CHAT_COMPLETION=5
# DEFAULT: 5
POINTS_STREAK_BONUS=5

# 돌봄 액션 포인트 소모값
# DEFAULT: 8
CAT_COST_FEED=8
# DEFAULT: 6
CAT_COST_BATH=6
# DEFAULT: 5
CAT_COST_PLAY=5
# DEFAULT: 10
CAT_COST_MEDICINE=10
# DEFAULT: 15
CAT_COST_INJECTION=15

# 시간 기반 상태 전이 기준
# DEFAULT: 12
CAT_HUNGER_AFTER_HOURS=12
# DEFAULT: 7
CAT_DEATH_AFTER_NO_FEED_DAYS=7
# DEFAULT: 24
CAT_SMELLY_AFTER_HOURS=24
# DEFAULT: 72
CAT_SICK_AFTER_SMELLY_HOURS=72
# DEFAULT: 3
CAT_STRESS_AFTER_PLAY_MISS_HOURS=3
# DEFAULT: 12
CAT_STRESS_WARNING_LIMIT_HOURS=12
# DEFAULT: 15
CAT_SICK_AFTER_NO_PLAY_HOURS=15

# 성장 및 장기 보상 기준
# DEFAULT: 30
CAT_STAGE_JUNIOR_DAYS=30
# DEFAULT: 90
CAT_STAGE_ADULT_DAYS=90
# DEFAULT: 150
CAT_STAGE_MIDDLE_AGE_DAYS=150
# DEFAULT: 210
CAT_STAGE_SENIOR_DAYS=210
# DEFAULT: 280
CAT_STAGE_VETERAN_DAYS=280
# DEFAULT: 365
CAT_STAGE_LEGACY_DAYS=365
# DEFAULT: 365
CAT_EXTRA_KITTEN_REWARD_DAYS=365
```

## 이미지 프롬프트 자산

향후 Gemini Nano Banana 등으로 캐릭터 상태 화면을 생성할 수 있도록 프롬프트를 파일로 관리한다.

### 프롬프트 디렉토리

- `assets/prompts/nano-banana/cats/kitten-base.txt`
- `assets/prompts/nano-banana/cats/kitten-hungry.txt`
- `assets/prompts/nano-banana/cats/kitten-sick.txt`
- `assets/prompts/nano-banana/cats/kitten-smelly.txt`
- `assets/prompts/nano-banana/cats/kitten-stressed.txt`
- `assets/prompts/nano-banana/cats/kitten-critical.txt`
- `assets/prompts/nano-banana/cats/kitten-dead.txt`
- `assets/prompts/nano-banana/cats/junior-healthy.txt`
- `assets/prompts/nano-banana/cats/adult-healthy.txt`
- `assets/prompts/nano-banana/cats/middle-age-healthy.txt`
- `assets/prompts/nano-banana/cats/senior-healthy.txt`
- `assets/prompts/nano-banana/cats/veteran-healthy.txt`
- `assets/prompts/nano-banana/cats/adult-legacy.txt`

### 프롬프트 작성 규칙

- 고양이의 성장 단계, 감정, 상태 이상, 배경, UI 컷 구도를 분리해서 명시한다.
- 동일 캐릭터 일관성을 위해 털색, 눈색, 얼굴 비율, 꼬리 특징을 고정한다.
- "mobile game pet care screen" 같은 사용 목적 문구를 포함한다.
- 과한 사실주의보다 친근한 2D 게임풍을 우선한다.

### 샘플 프롬프트

```text
Create a 2D mobile game pet character screen.
A small cream-colored kitten with round face, short legs, amber eyes, and a tiny blue collar.
Mood: healthy, curious, loved.
Scene: cozy study desk corner with vocabulary cards and warm daylight.
Style: polished casual game art, soft shading, clean silhouette, highly readable at mobile size.
No text, no watermark, no UI overlay.
```

```text
Create a 2D mobile game pet care status screen.
The same cream-colored kitten character, now visibly hungry and slightly tired, looking at an empty food bowl.
Mood: needs care but still cute, not horror.
Scene: notebook-themed learning room, soft paper textures, subtle icons area left empty for UI composition.
Style: warm casual tamagotchi-like game illustration, expressive face, consistent character design.
No text, no watermark.
```

## 품질 기준

- 포인트 계산과 고양이 상태 전이는 순수 함수 테스트 우선
- 시간 경계값 테스트 필수
- 테스트 커버리지 80% 이상 목표
- 모바일 우선 UI와 반응형 대응 유지

## 문서

- `PRD.md`: 제품 기획
- `UI.md`: 화면 구조와 UX 규칙
- `Tasklist.md`: 최소 함수 단위 기준 구현 태스크

## 추후 파이어베이스 연동 로드맵 (Phase 8)

현재 UI 시각화 단계(Phase 6)는 프론트엔드 단독 시뮬레이션을 위해 `LocalStorage` 기반의 Mock 전역 상태를 활용하여 임시 구동됩니다.
향후 다음과 같은 Firebase 연동(Backend) 작업을 진행할 예정입니다:
- **Cat 상태 원격 동기화**: `useCat` 훅을 Firebase Firestore 등과 연동하여 데이터 지속성을 보장합니다.
- **포인트 렛저 분산 동기화**: 오프라인/로컬에서 발생한 돌봄 포인트 변동 내역을 서버와 안전하게 배칭 동기화(`syncPendingPoints`)합니다.
