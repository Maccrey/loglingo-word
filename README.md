WordFlow

AI 기반 글로벌 언어 학습 플랫폼

1. 개요

단어 → 문장 → 대화까지 연결되는 학습 시스템

2. 주요 기능
   단어 학습
   AI 대화
   리더보드
   SNS 공유
   결제 시스템
3. 기술 스택
   Next.js 15
   TypeScript
   Firebase (Firestore)
   Polar.sh (결제)
   OpenAI (ChatGPT)
4. 프로젝트 구조

apps/web → UI (Antigravity)
services/core → 비즈니스 로직 (Codex)
services/ai → AI 처리
services/payment → 결제
services/leaderboard → 랭킹

5. 실행 방법

pnpm install
pnpm dev

6. AI 사용 전략
   대화 → 항상 사용
   추천 → 주 1회
   예문 → fallback
7. 결제 (Polar)
   설치

pnpm add @polar-sh/sdk

결제 생성

const session = await polar.checkout.sessions.create({
product_id: "premium"
})

Webhook

checkout.session.completed → 사용자 권한 업데이트

8. i18n 구조

/locales
ko.json
en.json

9. 품질 기준
   테스트 커버리지 ≥ 80%
   Lighthouse ≥ 90
10. 배포
    Vercel
    Firebase Hosting
