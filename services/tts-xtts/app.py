import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import torch
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask
from TTS.api import TTS


MODEL_NAME = os.getenv("XTTS_MODEL_NAME", "tts_models/multilingual/multi-dataset/xtts_v2")
DEFAULT_SPEAKER = os.getenv("XTTS_DEFAULT_SPEAKER", "Ana Florence")
DEVICE = os.getenv("XTTS_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")

tts_model: TTS | None = None


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=240)
    language: Literal["en", "ko", "ja", "zh-cn", "de"]
    speaker: str | None = None
    split_sentences: bool = False


@asynccontextmanager
async def lifespan(_: FastAPI):
    global tts_model

    tts_model = TTS(MODEL_NAME).to(DEVICE)
    yield
    tts_model = None


app = FastAPI(title="WordFlow XTTS Server", version="0.1.0", lifespan=lifespan)


@app.get("/health")
async def health():
    return {
        "ok": tts_model is not None,
        "model": MODEL_NAME,
        "device": DEVICE,
        "defaultSpeaker": DEFAULT_SPEAKER,
    }


@app.post("/tts")
async def synthesize(payload: TTSRequest):
    if tts_model is None:
        raise HTTPException(status_code=503, detail="XTTS model is not ready.")

    try:
        temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        temp_path = Path(temp_file.name)
        temp_file.close()

        tts_model.tts_to_file(
            text=payload.text,
            file_path=str(temp_path),
            speaker=payload.speaker or DEFAULT_SPEAKER,
            language=payload.language,
            split_sentences=payload.split_sentences,
        )

        return FileResponse(
            path=temp_path,
            media_type="audio/wav",
            filename="speech.wav",
            background=BackgroundTask(lambda: temp_path.unlink(missing_ok=True)),
        )
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"message": f"XTTS synthesis failed: {error}"},
        )
