/**
 * openai-client.ts
 *
 * OpenAI GPT-4o 기반 채팅 완성 클라이언트.
 * OPENAI_API_KEY 환경변수가 없으면 mock 응답으로 fallback한다.
 *
 * HIGH-RISK-UNREVIEWED: 외부 API 키 처리 포함
 */

import type { AIChatCompletionClient, AIChatCompletionInput, AIChatCompletionResult } from './api';

// --- Mock 클라이언트 (OPENAI_API_KEY 없을 때 사용) ---

class MockCompletionClient implements AIChatCompletionClient {
  async complete(input: AIChatCompletionInput): Promise<AIChatCompletionResult> {
    const nativeLang = input.nativeLanguage;
    return {
      assistantMessage: `[Mock] "${input.userMessage}" — Great attempt! Keep it up.`,
      correctionRaw: JSON.stringify({
        corrected: input.userMessage,
        feedback: `[Mock] This is a simulated correction. Add OPENAI_API_KEY to enable real AI responses. (${nativeLang}: 테스트 모드 — OPENAI_API_KEY를 설정하면 실제 AI 응답이 활성화됩니다.)`
      })
    };
  }
}

// --- OpenAI 클라이언트 ---

class OpenAICompletionClient implements AIChatCompletionClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(input: AIChatCompletionInput): Promise<AIChatCompletionResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // HIGH-RISK-UNREVIEWED: API 키는 서버 사이드에서만 전송
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: input.prompt
          },
          {
            role: 'user',
            content: input.userMessage
          }
        ],
        temperature: 0.8,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API 오류 (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const rawContent = data.choices[0]?.message?.content ?? '';

    // JSON 교정 블록 분리: 마지막 {...} 추출
    const jsonMatch = rawContent.match(/\{[^{}]*"corrected"[^{}]*\}/s);
    const correctionRaw = jsonMatch ? jsonMatch[0] : JSON.stringify({ corrected: '', feedback: '' });
    const assistantMessage = rawContent.replace(jsonMatch?.[0] ?? '', '').trim();

    return {
      assistantMessage: assistantMessage || rawContent,
      correctionRaw
    };
  }
}

// --- 팩토리 함수 ---

/**
 * 환경변수 OPENAI_API_KEY 유무에 따라 실제/mock 클라이언트를 반환한다.
 * Next.js API Route(서버 사이드)에서만 호출해야 한다.
 */
export function createCompletionClient(): AIChatCompletionClient {
  const apiKey = process.env['OPENAI_API_KEY'];

  if (!apiKey) {
    console.warn(
      '[AI Chat] OPENAI_API_KEY 없음 — Mock 응답 사용. 실제 서비스에서는 .env.local에 OPENAI_API_KEY를 설정하세요.'
    );
    return new MockCompletionClient();
  }

  return new OpenAICompletionClient(apiKey);
}
