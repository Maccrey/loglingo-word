WordFlow — AI 기반 글로벌 언어 학습 플랫폼

1. 제품 개요
   문제
   단어 암기가 실제 회화로 이어지지 않음
   학습 지속성이 낮음
   개인화 부족
   AI 사용 시 비용 문제 발생
   목표
   가입 전환율 ≥ 60%
   D1 유지율 ≥ 55%
   D7 유지율 ≥ 40%
   결제 전환율 ≥ 5%
2. 핵심 전략
   Hybrid 학습 구조
   80%: 커리큘럼 기반 학습
   20%: AI 개인화 추천 (주 1회)
   학습 흐름

유입 → 가입 → 단어 학습 → 문장 학습 → AI 대화 → 리더보드 → 유지

3. 핵심 기능
   3.1 언어 설정
   nativeLanguage (모국어)
   targetLanguage (학습 언어)
   3.2 단어 학습
   커리큘럼 기반 단어
   사용자 입력 단어
   틀린 단어 자동 저장
   3.3 Memory Engine
   retrievalStrength
   storageStrength
   forgetting curve 적용
   3.4 리더보드
   기준: 3회 연속 정답
   주간 집계
   3.5 게임화 시스템
   Point
   Streak
   Daily Goal
   Level
   3.6 AI Hybrid 시스템
   기본: DB 기반 단어
   AI: 주 1회 추천
   3.7 AI 대화
   ChatGPT 기반
   문법 교정
   단어 교정
   자연스러운 대화 유지
   3.8 SNS (Mini Feed)
   학습 결과 공유
   자동 포스트 생성
   퀘스트 보상
   3.9 결제 시스템
   Polar.sh 사용
   기능:
   광고 제거
   언어 unlock
   AI 확장
   3.10 i18n
   JSON 기반 다국어 UI
   locale fallback 지원
4. 성공 지표
   지표 목표
   가입 전환율 ≥ 60%
   D1 유지율 ≥ 55%
   D7 유지율 ≥ 40%
   리더보드 참여율 ≥ 40%
   SNS 공유율 ≥ 25%
   결제 전환율 ≥ 5%
5. 데이터 모델 (핵심)
   users
   id
   nativeLanguage
   targetLanguage
   vocab_progress
   wordId
   correctStreak
   storageStrength
   retrievalStrength
   leaderboard

/leaderboards/{weekId}/users/{userId}

ai_recommendations
userId
weekId
words[]
chat_messages
userId
message
corrected
feedback 6. 아키텍처

Client (Antigravity UI)
→ API (Codex Logic)
→ Firebase
→ AI (ChatGPT)

7. 비기능 요구사항
   AI 응답 ≤ 1.5s
   LCP ≤ 2.5s
   오류율 ≤ 0.5%
   가용성 ≥ 99.9%
8. 리스크 및 대응
   AI 비용 증가

→ Hybrid 모델 적용

치팅

→ streak + validation

초기 콘텐츠 부족

→ 기본 커리큘럼 제공

9. 런칭 플랜
   MVP
   단어 학습
   리더보드
   기본 UI
   MLP
   AI 대화
   이메일
   GA
   결제
   SNS
