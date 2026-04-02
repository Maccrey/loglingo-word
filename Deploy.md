# 배포 가이드

이 문서는 `Loglingo Word`를 Firebase에 배포할 때 필요한 선택, 설정, 자동 배포 흐름을 한 번에 정리한 문서다.

## 어떤 서비스를 써야 하나

이 프로젝트는 `Next.js App Router + API Route` 구조다.
정적 HTML만 올리는 사이트가 아니라 서버 런타임이 필요하므로 `Firebase Hosting` 단독이 아니라 `Firebase App Hosting`을 선택해야 한다.

근거:

- `apps/web/src/app/api/chat/route.ts`
- `apps/web/src/app/api/tts/route.ts`

둘 다 서버에서 실행되는 API 라우트이므로 정적 호스팅만으로는 처리할 수 없다.

공식 문서:

- https://firebase.google.com/docs/app-hosting/about-app-hosting
- https://firebase.google.com/docs/app-hosting/get-started
- https://firebase.google.com/docs/app-hosting/configure

## 현재 저장소에 들어 있는 배포 파일

- [firebase.json](/Users/maccrey/Development/Loglingo_word/firebase.json)
- [apphosting.yaml](/Users/maccrey/Development/Loglingo_word/apps/web/apphosting.yaml)
- [firebase-app-hosting.yml](/Users/maccrey/Development/Loglingo_word/.github/workflows/firebase-app-hosting.yml)

역할:

- `firebase.json`
App Hosting 소스 배포 시 `apps/web`를 루트로 사용하도록 지정한다.

- `apps/web/apphosting.yaml`
런타임 비용 절감 설정을 담는다.

- `.github/workflows/firebase-app-hosting.yml`
`main` 브랜치 push 시 Firebase App Hosting으로 자동 배포한다.

## 비용 최소화 런타임 설정

현재 [apphosting.yaml](/Users/maccrey/Development/Loglingo_word/apps/web/apphosting.yaml)은 비용을 최대한 낮추는 쪽으로 잡혀 있다.

```yaml
runConfig:
  minInstances: 0
  maxInstances: 1
  concurrency: 1
  cpu: 0
  memoryMiB: 512
```

의미:

- `minInstances: 0`
항상 떠 있는 인스턴스를 두지 않는다.

- `maxInstances: 1`
트래픽이 급증해도 최대 1개 인스턴스만 뜬다.

- `cpu: 0`
가장 저렴한 쪽을 우선한다.

- `memoryMiB: 512`
메모리도 최소 수준에 가깝게 유지한다.

- `concurrency: 1`
저비용 CPU 설정과 맞추어 동시 처리도 낮게 잡는다.

주의:

- 비용은 낮아지지만 응답 속도와 피크 트래픽 대응력은 떨어진다.
- 지금 설정은 “개인 프로젝트 / 저트래픽 / 비용 우선” 기준이다.

## Firebase 콘솔에서 해야 할 일

### 1. App Hosting 백엔드 생성

1. Firebase 콘솔에서 프로젝트를 연다.
2. 왼쪽 메뉴에서 `App Hosting`을 선택한다.
3. `Create backend`를 누른다.
4. GitHub 저장소로 `Maccrey/loglingo-word`를 연결한다.
5. 배포 루트는 `apps/web`로 지정한다.
6. Live branch는 `main`으로 지정한다.
7. Backend ID는 예를 들어 `wordflow-web`로 만든다.

이 값은 GitHub Secrets의 `FIREBASE_APP_HOSTING_BACKEND_ID`와 동일해야 한다.

### 2. 런타임 환경 변수 입력

App Hosting 설정 화면에서 아래 값을 넣는다.

필수:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `OPENAI_API_KEY`

선택:

- `XTTS_API_URL`
- `XTTS_DEFAULT_SPEAKER`
- `XTTS_API_KEY`

설명:

- `XTTS_API_URL`이 없으면 단어 발음은 브라우저 TTS fallback으로 동작한다.
- 비용을 아끼고 싶으면 평소에는 XTTS 서버를 꺼두고 필요할 때만 켜는 식으로 운영할 수 있다.

## GitHub Actions 자동 배포

현재 저장소에는 [firebase-app-hosting.yml](/Users/maccrey/Development/Loglingo_word/.github/workflows/firebase-app-hosting.yml)이 들어 있다.

이 워크플로는 아래 시점에 동작한다.

- `main` 브랜치 push
- 수동 실행 `workflow_dispatch`

배포 명령:

```bash
firebase deploy --project "$FIREBASE_PROJECT_ID" --only "apphosting:$FIREBASE_APP_HOSTING_BACKEND_ID"
```

공식 참고:

- https://firebase.google.com/docs/app-hosting/alt-deploy
- https://firebase.google.com/docs/app-hosting/rollouts

## GitHub Secrets

GitHub 저장소 `Settings > Secrets and variables > Actions`에 아래 3개를 추가해야 한다.

- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_HOSTING_BACKEND_ID`
- `FIREBASE_SERVICE_ACCOUNT`

### FIREBASE_SERVICE_ACCOUNT에 넣을 값

서비스 계정 JSON 전체 문자열을 넣는다.

예시 구조:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

권한은 최소한 App Hosting 배포가 가능해야 한다.
보수적으로 시작하려면 Firebase/Cloud Run 배포가 가능한 편집 권한 계정으로 먼저 확인하고, 이후 필요한 최소 권한으로 줄이는 편이 안전하다.

## XTTS 운영 전략

XTTS는 Firebase App Hosting에 직접 올리지 않는다.
이유:

- Python 런타임 필요
- 모델 크기가 큼
- 비용이 높아질 수 있음
- App Hosting은 웹앱 런타임용이고, TTS 모델 서버까지 함께 올리는 구조로는 비효율적임

권장 구조:

- 웹앱: Firebase App Hosting
- XTTS: 외부 서버 또는 별도 컨테이너

예:

- Cloud Run
- VM
- GPU 서버
- 로컬 전용 개발 서버

비용 최소화 방식:

- `XTTS_API_URL`이 없으면 브라우저 TTS fallback 사용
- XTTS 서버는 필요할 때만 실행
- 같은 단어/언어 조합은 브라우저 세션에서 재사용
- `/api/tts` 응답도 캐시 가능하게 설정

## 실제 배포 순서

1. GitHub 저장소에 코드 푸시
2. Firebase 콘솔에서 App Hosting 백엔드 생성
3. root directory를 `apps/web`로 설정
4. Backend ID 확인
5. GitHub Secrets 3개 추가
6. App Hosting 환경 변수 입력
7. `main`에 새 커밋 푸시
8. GitHub Actions 실행 확인
9. Firebase App Hosting 롤아웃 확인

## 배포 후 확인 항목

- 홈 화면 접속 가능 여부
- Google 로그인 정상 동작 여부
- `/api/chat` 응답 여부
- 단어 학습 화면 로딩 여부
- TTS fallback 또는 XTTS 재생 여부
- Firestore 읽기/쓰기 에러 여부

## 문제 발생 시 우선 확인

- App Hosting root가 `apps/web`로 맞는지
- `FIREBASE_APP_HOSTING_BACKEND_ID`가 콘솔 값과 동일한지
- `FIREBASE_SERVICE_ACCOUNT` JSON이 깨지지 않았는지
- `FIREBASE_PRIVATE_KEY` 줄바꿈이 올바른지
- `XTTS_API_URL`이 실제로 응답하는지
- GitHub Actions 로그에서 `firebase deploy` 실패 원인이 무엇인지

## 참고 링크

- https://firebase.google.com/docs/app-hosting/about-app-hosting
- https://firebase.google.com/docs/app-hosting/get-started
- https://firebase.google.com/docs/app-hosting/configure
- https://firebase.google.com/docs/app-hosting/alt-deploy
- https://firebase.google.com/docs/app-hosting/rollouts
