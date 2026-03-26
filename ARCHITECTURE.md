# Architecture & Design Decisions

이 문서는 Loglingo (WordFlow) 프로젝트의 핵심 아키텍처와 설계 결정 사항을 기록합니다.
AI와 인간 개발자가 시스템을 유지보수하고 확장할 때 기준이 되는 "단일 진실(Source of Truth)" 문서입니다.

## 1. UI / UX 아키텍처

### 1.1 스타일링 기법: Vanilla CSS + CSS Variables

- **결정 사항**: Tailwind CSS와 같은 프레임워크나 복잡한 CSS-in-JS 대신, **Vanilla CSS**와 표준 CSS 변수(`var(--...)`)를 사용하여 스타일링합니다.
- **이유**: 최소 복잡도 원칙을 준수하고, 특정 도구에 종속되지 않는 유연성을 확보하기 위함입니다. `globals.css`에 모든 테마 토큰을 정의하여 관리 포인트를 일원화합니다.

### 1.2 테마: 종이 감성 (Paper-like Aesthetic)

- **결정 사항**: 차갑고 어두운 시스템 테마에서 벗어나, 언어 학습에 어울리는 아날로그적이고 따뜻한 **종이 감성**으로 UI를 구성합니다.
- **이유**: 학습자에게 심리적 안정감을 주고, 책을 읽거나 노트를 필기하는 듯한 자연스러운 학습 경험(UX)을 제공하기 위해서입니다.
- **주요 토큰**:
  - `bg-paper` (#FDFBF7): 따뜻한 미색 종이 바탕
  - `text-ink` (#2C2A25): 잉크/먹물 느낌의 부드럽고 가독성 높은 다크 브라운/그레이
  - `border-pencil` (#E8E3D8): 연필선처럼 연하고 얇은 테두리
  - `shadow-paper`: 종이가 얇게 겹쳐진 듯한 매우 부드럽고 넓은 그림자

### 1.3 Cat 상태 전이 엔진 (State Transition Engine)
- **위치**: `packages/shared/src/cat/engine.ts`
- **결정 사항**: 고양이의 상태(`healthy`, `hungry`, `smelly`, `stressed`, `sick`, `critical`, `dead`)는 마지막 상호작용 시간(`lastFedAt`, `lastWashedAt`, `lastPlayedAt`)을 기준으로 계산된 순수 함수에 의해 결정된다.
- **상태 우선순위 및 역치(Threshold) 원칙**:
    1. **위험 상태(Dead, Critical, Sick)**: 세 가지 상호작용 중 가장 오래된 상호작용 기준(가장 방치된 시간)을 바탕으로 계산한다.
       - 누적 시간 = 현재 시간 - `Math.min(lastFedAt, lastWashedAt, lastPlayedAt)`
       - **Dead**: 방치 시간이 `HUNGRY_HOURS + SICK_HOURS + CRITICAL_HOURS + (DEAD_DAYS * 24)` 이상
       - **Critical**: 방치 시간이 `HUNGRY_HOURS + SICK_HOURS + CRITICAL_HOURS` 이상
       - **Sick**: 방치 시간이 `HUNGRY_HOURS + SICK_HOURS` 이상
    2. **기본 상태(Hungry, Smelly, Stressed)**: 위험 상태에 해당하지 않을 경우, 각각의 임계시간(`CAT_HUNGRY_HOURS` 등)을 초과한 상태를 활성화한다. 복수의 상태가 임계시간을 넘었을 경우: **Hungry > Smelly > Stressed** 순서로 우선순위를 가진다.
    3. **Healthy**: 위 어느 상태에도 해당하지 않는 경우.
- **목적**: 예측 가능한 타이머 기반 상태 악화 모델을 통해 사용자가 일정 간격으로 학습(돌봄)을 하도록 유도.

### 1.4 Cat 돌봄 액션 엔진 (Care Action Engine)
- **위치**: `packages/shared/src/cat/actions.ts`
- **결정 사항**: 돌봄 액션(먹이기, 씻기기, 놀아주기, 치료하기)은 고양이 상태 도메인과 포인트 도메인을 연결하는 순수 함수 인터페이스를 갖는다.
- **포인트 연동 원칙**: 액션 실행 전에 유저의 잔여 포인트를 확인하여 부족하면 액션이 실패(success: false)된다.
- **사망 상태 보호**: 상태가 'dead'인 고양이는 어떤 액션도 받아들이지 않는다.
- **치료 액션 분기**: 'heal' 액션 요청 시, 상태가 'sick'인지 'critical'인지에 따라 각각 `giveMedicine`, `giveInjection` 로직으로 분리되어 적용 가능하도록 설계한다.

### 1.5 Cat 성장 및 장기 보상 (Growth Engine)
- **위치**: `packages/shared/src/cat/growth.ts`
- **결정 사항**: 고양이의 `activeDays`는 고양이가 질병(`sick`), 위급(`critical`), 사망(`dead`) 상태가 아닐 때만 누적된다.
- **다중 슬롯 원칙**: 한 번 `legacy` 단계(약 1년 누적)에 도달한 고양이를 보유한 경우, 새로운 고양이(슬롯)를 추가로 입양할 수 있는 보상이 주어진다.
- **목적**: 지속 가능한 장기 리텐션을 유지하고 사용자가 여러 고양이를 돌보며 병행할 수 있게 한다.

### 1.6 학습과 돌봄 시스템 연동 (Learning-Care Integration)
- **위치**: `packages/shared/src/point/summary.ts`, `services/core/src/gamification.ts`
- **결정 사항**: 사용자의 학습 포인트 획득 시, 이를 돌봄 액션(먹이 x 번) 단위로 직관적으로 환산(`summarizeStudyToCareOutcome`)하여 보여준다.
- **안전 기준**: 하루 기본 유지비(먹이 1회 + 놀기 1회 + 씻기 1회 = 총 450포인트)를 기준으로, 해당 포인트를 달성하면 당일 할당량을 채운 것으로 판별(`isDailyStudyEnoughForCatCare`)한다.
- **포인트 발생 연동**: 기존 `gamification.ts`의 보상 처리 로직(Lesson, Review)과 신규 포인트 렛저(`createPointLedgerEntry`)를 동기화하여 실질적인 포인트 증감 처리를 통합한다.

## 2. 다국어 지원 (i18n) 정책

- **결정 사항**: 모든 사용자 노출 텍스트(UI, 알림, 에러 메시지 등)는 `PRD.md`에 명시된 i18n 계약(지원 언어 목록)을 엄격히 따르며, 코드 내 하드코딩을 금지합니다.
- **이유**: 글로벌 언어 학습 플랫폼으로서의 목표(MVP 이상)를 달성하기 위함입니다. 텍스트를 추가하거나 수정할 때는 반드시 언어 설정과 관련된 함수(`t(locale, key)`)를 통해 렌더링해야 합니다.
