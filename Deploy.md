# Firebase App Hosting 배포

이 앱은 API 라우트를 포함한 Next.js 앱이라 `Firebase Hosting` 단독보다 `Firebase App Hosting`이 맞다.

공식 근거:

- App Hosting은 Next.js 13.5+를 기본 지원한다.
- 자동 롤아웃은 GitHub 저장소의 live branch에 push될 때 동작한다.
- 비용 관련 런타임 설정은 `apphosting.yaml`의 `runConfig`로 관리한다.

출처:

- https://firebase.google.com/docs/app-hosting/about-app-hosting
- https://firebase.google.com/docs/app-hosting/get-started
- https://firebase.google.com/docs/app-hosting/configure

## 현재 저장소에 추가한 것

- [apphosting.yaml](/Users/maccrey/Development/Loglingo_word/apps/web/apphosting.yaml)
- `minInstances: 0`
- `maxInstances: 1`
- `cpu: 0`
- `memoryMiB: 512`
- `concurrency: 1`

이 설정은 항상 떠 있는 인스턴스를 두지 않고, 동시에 한 개 인스턴스만 띄워 비용을 가장 낮게 유지하는 쪽에 가깝다.
트래픽이 늘면 성능보다 비용 절감이 우선된다.

## 자동 배포 연결 절차

1. 이 프로젝트를 GitHub 저장소에 푸시한다.
2. Firebase 콘솔에서 App Hosting 백엔드를 만든다.
3. 저장소를 연결하고 app root를 `apps/web`로 지정한다.
4. live branch를 `main`으로 지정한다.
5. automatic rollouts를 켠다.

이후 `main` 브랜치에 커밋이 푸시될 때마다 자동 배포된다.

저장소 안에도 GitHub Actions 기반 대안 자동 배포를 추가했다.
[firebase-app-hosting.yml](/Users/maccrey/Development/Loglingo_word/.github/workflows/firebase-app-hosting.yml) 은 `main` push 시 `firebase deploy --only apphosting:BACKEND_ID`를 실행한다.

필요한 GitHub Secrets:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_HOSTING_BACKEND_ID`
- `FIREBASE_SERVICE_ACCOUNT`

`FIREBASE_SERVICE_ACCOUNT` 는 App Hosting 배포 권한이 있는 서비스 계정 JSON 전체 문자열이다.

루트 [firebase.json](/Users/maccrey/Development/Loglingo_word/firebase.json) 은 App Hosting 소스 배포용 기본 설정을 포함한다.

## 필요한 환경 변수

App Hosting에서는 콘솔 또는 `apphosting.yaml`을 통해 환경 변수를 넣을 수 있다.
이 프로젝트는 최소한 아래 값들이 런타임에 필요하다.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `OPENAI_API_KEY`

TTS를 외부 XTTS 서버로 붙일 때는 추가로 아래가 필요하다.

- `XTTS_API_URL`
- `XTTS_DEFAULT_SPEAKER`
- `XTTS_API_KEY` 선택

## 비용 최소화 팁

- XTTS 서버는 Firebase에 올리지 말고 외부로 분리한다.
- 평소에는 `XTTS_API_URL`을 비워서 브라우저 음성 fallback만 써도 된다.
- TTS가 필요할 때만 XTTS 서버를 켠다.
- 같은 단어는 브라우저 세션 캐시와 `/api/tts` 캐시를 재사용한다.
- Firestore 쓰기는 로그인 시 중복 저장을 줄이고, 학습 상태는 디바운스해서 배치한다.
