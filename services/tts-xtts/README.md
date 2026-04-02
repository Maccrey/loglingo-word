# XTTS Server

`/api/tts` 업스트림으로 붙일 수 있는 최소 `XTTS-v2` FastAPI 서버다.

## 지원 언어

- `en`
- `ko`
- `ja`
- `zh-cn`
- `de`

## 설치

```bash
cd services/tts-xtts
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 실행

```bash
cd services/tts-xtts
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8020
```

## 환경 변수

```env
XTTS_MODEL_NAME=tts_models/multilingual/multi-dataset/xtts_v2
XTTS_DEFAULT_SPEAKER=Ana Florence
XTTS_DEVICE=cuda
```

CPU에서 시험할 때는 `XTTS_DEVICE=cpu`로 바꿀 수 있다. 다만 응답 속도는 느리다.

## 요청 형식

```json
{
  "text": "hello",
  "language": "en",
  "speaker": "Ana Florence",
  "split_sentences": false
}
```

## 응답

- 성공 시 `audio/wav`
- 실패 시 JSON `{ "message": "..." }`

## 앱 연결

루트 `.env.local` 또는 실행 환경에 아래를 맞춘다.

```env
XTTS_API_URL=http://127.0.0.1:8020/tts
XTTS_DEFAULT_SPEAKER=Ana Florence
```
