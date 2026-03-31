import type { AIChatMessage } from './chat';

export type ConversationUserLevel = 'beginner' | 'intermediate' | 'advanced';

export type AiFriendGender = 'male' | 'female';

// =============================================================================
// AI 이성친구 이름 매핑
// ─────────────────────────────────────────────────────────────────────────────
// 새 학습 언어 추가 시 반드시 이 객체에 남성/여성 이름을 추가해야 한다.
// 언어 코드는 SupportedLearningLanguage 와 동일한 값을 사용한다.
// (packages/shared/src/types.ts 의 supportedLearningLanguages 참고)
// =============================================================================
export const AI_FRIEND_NAMES: Record<
  string,
  { male: string; female: string }
> = {
  en: { male: 'Ryan', female: 'Emily' },   // 영어 학습
  ja: { male: 'Ren', female: 'Yui' },      // 일본어 학습
  ko: { male: '민준', female: '소연' },     // 한국어 학습
  zh: { male: 'Wei', female: 'Mei' },      // 중국어 학습
  de: { male: 'Leon', female: 'Lena' },    // 독일어 학습
  // ── 새 언어 추가 예시 ──────────────────────────────────────────────────────
  // fr: { male: 'Louis', female: 'Camille' },  // 프랑스어 학습
  // es: { male: 'Carlos', female: 'Sofia' },   // 스페인어 학습
  // ──────────────────────────────────────────────────────────────────────────
};

/**
 * 유저 성별의 반대 성별을 반환한다.
 * 유저가 female → AI 친구는 male, 반대도 동일.
 */
export function getAiFriendGender(userGender: AiFriendGender): AiFriendGender {
  return userGender === 'female' ? 'male' : 'female';
}

/**
 * 학습 언어와 AI 친구 성별로 AI 이름을 반환한다.
 * 지원하지 않는 언어는 학습 언어 코드를 그대로 반환한다.
 */
export function getAiFriendName(
  targetLanguage: string,
  aiFriendGender: AiFriendGender
): string {
  const names = AI_FRIEND_NAMES[targetLanguage];
  if (!names) {
    // 아직 이름이 등록되지 않은 언어: 새 언어 추가 시 AI_FRIEND_NAMES에 등록 필요
    return aiFriendGender === 'male' ? 'Alex' : 'Sam';
  }
  return names[aiFriendGender];
}

export type ConversationPromptInput = {
  nativeLanguage: string;
  targetLanguage: string;
  userLevel: ConversationUserLevel;
  recentMessages: AIChatMessage[];
  /** AI 친구 성별 (유저 성별의 반대) */
  aiFriendGender: AiFriendGender;
  /** AI 친구 이름 (학습 언어별 고유 이름) */
  aiFriendName: string;
};

function formatRecentMessages(messages: AIChatMessage[]): string {
  if (messages.length === 0) {
    return 'No recent conversation history.';
  }

  return messages
    .map((message) => `[${message.role}] ${message.message}`)
    .join('\n');
}

export function buildConversationPrompt(
  input: ConversationPromptInput
): string {
  const levelGuide: Record<ConversationUserLevel, string> = {
    beginner: 'very simple vocabulary and short sentences',
    intermediate: 'everyday expressions and moderate sentence complexity',
    advanced: 'natural, nuanced expressions like a native speaker would use'
  };

  return [
    // ── 페르소나 선언 ──────────────────────────────────────────────────────────
    `You are ${input.aiFriendName}, a friendly ${input.aiFriendGender} language partner.`,
    `You are having a casual, warm conversation with a ${input.nativeLanguage}-speaking learner.`,
    `Your goal is to make the conversation feel natural and fun — like chatting with a close friend, not a textbook.`,
    '',
    // ── 언어 설정 ─────────────────────────────────────────────────────────────
    `Native language of the learner: ${input.nativeLanguage}`,
    `Language being practiced: ${input.targetLanguage}`,
    `Learner level: ${input.userLevel} — use ${levelGuide[input.userLevel]}.`,
    '',
    // ── 대화 스타일 ───────────────────────────────────────────────────────────
    `Reply primarily in ${input.targetLanguage}.`,
    `Use ${input.nativeLanguage} sparingly — only when a short clarification is essential.`,
    `Keep your replies conversational and encouraging. Avoid formal or textbook-like phrasing.`,
    '',
    // ── 교정 어드바이스 ───────────────────────────────────────────────────────
    `If the learner makes a grammar or expression mistake:`,
    `  1. First respond naturally to what they were trying to say (don't break the flow).`,
    `  2. Then, at the END of your reply, include a correction block in this exact JSON format:`,
    `     {"corrected": "<corrected sentence>", "feedback": "<short native-speaker tip in ${input.nativeLanguage}>"}`,
    `     Example feedback: "원어민이라면 이렇게 말해요: 'I'm good, thanks!' — 'I am good' 보다 더 자연스러워요."`,
    `  3. If the sentence is already correct, omit the JSON correction block entirely.`,
    '',
    // ── 최근 대화 ─────────────────────────────────────────────────────────────
    'Recent conversation:',
    formatRecentMessages(input.recentMessages)
  ].join('\n');
}
