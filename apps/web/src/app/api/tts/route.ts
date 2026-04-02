import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const CACHE_CONTROL_HEADER = 'public, max-age=31536000, immutable';

const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(240),
  language: z.enum(['en', 'ko', 'ja', 'zh', 'de'])
});

const xttsLanguageMap: Record<
  z.infer<typeof ttsRequestSchema>['language'],
  string
> = {
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  zh: 'zh-cn',
  de: 'de'
};

function decodeBase64Audio(base64: string): ArrayBuffer {
  const buffer = Buffer.from(base64, 'base64');
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}

async function forwardAudioResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? 'audio/wav';
  const audioBuffer = await response.arrayBuffer();

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': CACHE_CONTROL_HEADER
    }
  });
}

async function resolveJsonAudio(payload: Record<string, unknown>) {
  const directBase64 =
    typeof payload.audioBase64 === 'string'
      ? payload.audioBase64
      : typeof payload.audio === 'string' && !payload.audio.startsWith('http')
        ? payload.audio
        : typeof payload.wav === 'string'
          ? payload.wav
          : null;

  if (directBase64) {
    return new NextResponse(decodeBase64Audio(directBase64), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': CACHE_CONTROL_HEADER
      }
    });
  }

  const remoteAudioUrl =
    typeof payload.url === 'string'
      ? payload.url
      : typeof payload.audioUrl === 'string'
        ? payload.audioUrl
        : typeof payload.file_url === 'string'
          ? payload.file_url
          : null;

  if (!remoteAudioUrl) {
    throw new Error('XTTS response did not contain playable audio.');
  }

  const remoteResponse = await fetch(remoteAudioUrl, {
    cache: 'no-store'
  });

  if (!remoteResponse.ok) {
    throw new Error(`XTTS audio fetch failed with status ${remoteResponse.status}.`);
  }

  return forwardAudioResponse(remoteResponse);
}

export async function POST(request: Request) {
  const xttsApiUrl = process.env.XTTS_API_URL;

  if (!xttsApiUrl) {
    return NextResponse.json(
      { message: 'XTTS_API_URL is not configured.' },
      { status: 503 }
    );
  }

  try {
    const input = ttsRequestSchema.parse(await request.json());
    const upstreamResponse = await fetch(xttsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.XTTS_API_KEY
          ? { Authorization: `Bearer ${process.env.XTTS_API_KEY}` }
          : {})
      },
      body: JSON.stringify({
        text: input.text,
        language: xttsLanguageMap[input.language],
        speaker: process.env.XTTS_DEFAULT_SPEAKER ?? 'Ana Florence',
        split_sentences: false
      }),
      cache: 'force-cache'
    });

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      throw new Error(
        `XTTS upstream failed (${upstreamResponse.status}): ${errorBody || 'no body'}`
      );
    }

    const contentType = upstreamResponse.headers.get('content-type') ?? '';

    if (contentType.startsWith('audio/')) {
      return forwardAudioResponse(upstreamResponse);
    }

    const payload = (await upstreamResponse.json()) as Record<string, unknown>;
    return resolveJsonAudio(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'TTS synthesis failed.';

    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: url.searchParams.get('text') ?? '',
        language: url.searchParams.get('language') ?? 'en'
      })
    })
  );
}
