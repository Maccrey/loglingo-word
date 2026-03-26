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

## 2. 다국어 지원 (i18n) 정책

- **결정 사항**: 모든 사용자 노출 텍스트(UI, 알림, 에러 메시지 등)는 `PRD.md`에 명시된 i18n 계약(지원 언어 목록)을 엄격히 따르며, 코드 내 하드코딩을 금지합니다.
- **이유**: 글로벌 언어 학습 플랫폼으로서의 목표(MVP 이상)를 달성하기 위함입니다. 텍스트를 추가하거나 수정할 때는 반드시 언어 설정과 관련된 함수(`t(locale, key)`)를 통해 렌더링해야 합니다.
