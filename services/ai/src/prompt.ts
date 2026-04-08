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
  /**
   * 누적 학습 이력 요약 텍스트 (chatLearningStorage.formatProgressForPrompt 결과).
   * 있으면 프롬프트 앞에 주입해 재학습을 방지한다.
   * API 비용 절감: raw history 대신 ~150 토큰 압축 요약.
   */
  learningProgressSummary?: string;
};

function formatRecentMessages(messages: AIChatMessage[]): string {
  if (messages.length === 0) {
    return 'No recent conversation history.';
  }

  return messages
    .map((message) => `[${message.role}] ${message.message}`)
    .join('\n');
}

// =============================================================================
// 언어 코드 → 사람이 읽기 쉬운 언어명 변환
// ─────────────────────────────────────────────────────────────────────────────
// 새 학습 언어 추가 시 이 테이블에도 함께 추가한다.
// =============================================================================
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ko: '한국어',
  ja: '일본어',
  zh: '중국어',
  en: '영어',
  de: '독일어',
  fr: '프랑스어',
  es: '스페인어',
  it: '이탈리아어',
  pt: '포르투갈어',
  ru: '러시아어',
  ar: '아랍어',
  vi: '베트남어',
  th: '태국어',
  id: '인도네시아어',
  ms: '말레이어',
  hi: '힌디어',
  tr: '터키어',
  nl: '네덜란드어',
};

/**
 * 언어 코드를 사람이 읽기 쉬운 언어명으로 변환한다.
 * 등록되지 않은 코드는 코드 그대로 반환한다.
 */
export function getLanguageDisplayName(langCode: string): string {
  return LANGUAGE_DISPLAY_NAMES[langCode] ?? langCode;
}

/**
 * 5단계 외국어 회화 마스터 코칭 지침 프롬프트를 생성한다.
 *
 * 단계:
 *   1단계: 오늘의 필수 단어 및 입력 가이드 (Pre-study)
 *   2단계: 핵심 문장 고정 (Subject + Verb)
 *   3단계: 부가 정보 확장 (Expansion)
 *   4단계: 원어민 패턴 적용 (Patterns)
 *   5단계: 실전 상황극 및 환경 구축 (Application)
 */
export function buildConversationPrompt(
  input: ConversationPromptInput
): string {
  const nativeLangName = getLanguageDisplayName(input.nativeLanguage);
  const targetLangName = getLanguageDisplayName(input.targetLanguage);

  const levelGuide: Record<ConversationUserLevel, string> = {
    beginner: '입문자 수준 — 매우 짧고 쉬운 단어와 기초 문장만 사용한다.',
    intermediate: '중급자 수준 — 일상 표현과 약간의 복잡한 문장 구조를 활용한다.',
    advanced: '고급자 수준 — 원어민이 쓰는 자연스럽고 세밀한 표현을 구사한다.'
  };

  return [
    // ── 누적 학습 이력 (있을 때만) — 재학습 방지, 토큰 절감 ──────────────────
    ...(input.learningProgressSummary
      ? [input.learningProgressSummary, '']
      : []),

    // ── 역할 선언 ──────────────────────────────────────────────────────────────
    `너는 ${input.aiFriendName}, ${targetLangName} 회화 전문 코치야.`,
    `학습자의 모국어는 "${nativeLangName}"이고, 배우려는 언어는 "${targetLangName}"이야.`,
    `학습자 수준: ${levelGuide[input.userLevel]}`,
    '',
    // ── 핵심 목표 ─────────────────────────────────────────────────────────────
    `[학습 목표]`,
    `학습자가 문법책을 붙들고 씨름하는 대신, 어순 규칙을 몸에 익히고 상황극을 통해 바로 입을 뗄 수 있게 도와줘.`,
    `단어 하나라도 맥락 속에서 살아 움직이게 가르쳐줘.`,
    '',
    // ── 1단계: 단어 및 입력 가이드 ───────────────────────────────────────────
    `[1단계: 오늘의 필수 단어 및 입력 가이드 (Pre-study)]`,
    `대화 주제를 제안하기 전에, 해당 상황에서 꼭 필요한 단어 3~5개를 알려줘.`,
    `일본어·중국어처럼 입력이 특수한 언어는 반드시 아래 형식을 사용해:`,
    `  예: (일본어) 먹다: 食べる [taberu / 타베루]`,
    `  예: (중국어) 밥 먹다: 吃饭 [chī fàn / 츠판]`,
    '',
    // ── 2단계: 핵심 문장 ──────────────────────────────────────────────────────
    `[2단계: 핵심 문장 고정 (Subject + Verb)]`,
    `${targetLangName}의 기본 어순 규칙을 한 줄로 먼저 설명해줘.`,
    `학습자가 "누가 + 무엇을 한다"는 핵심 틀을 먼저 입으로 뱉을 수 있도록 유도해줘.`,
    `조사가 없어도 어순만으로 뜻이 통하는 구조를 우선 연습시켜줘.`,
    '',
    // ── 3단계: 문장 확장 ──────────────────────────────────────────────────────
    `[3단계: 부가 정보 확장 (Expansion)]`,
    `핵심 문장이 완성되면, "어디서?", "언제?", "어떻게?" 등을 하나씩 추가하도록 질문을 던져줘.`,
    `학습자가 스스로 문장을 늘려가게 유도해줘. 정답을 바로 주지 말고 먼저 시도하게 해줘.`,
    '',
    // ── 4단계: 원어민 패턴 ────────────────────────────────────────────────────
    `[4단계: 원어민 패턴 적용 (Patterns)]`,
    `단순 직역으로는 알기 어려운 ${targetLangName}만의 고유 표현(문화적 배경이 담긴 패턴) 하나를 소개해줘.`,
    `학습자가 자신의 상황에 맞춰 그 패턴을 직접 변형해 말해보게 유도해줘.`,
    '',
    // ── 5단계: 상황극 ─────────────────────────────────────────────────────────
    `[5단계: 실전 상황극 및 환경 구축 (Application)]`,
    `배운 표현을 쓸 수밖에 없는 구체적인 상황(카페 주문, 길 묻기, 친구에게 연락 등)을 설정해줘.`,
    `학습자가 배운 단어와 어순 규칙을 활용해 대화를 이어가도록 유도하고, 틀린 부분은 즉시 교정해줘.`,
    '',
    // ── 응답 언어 규칙 ────────────────────────────────────────────────────────
    `[응답 언어 규칙]`,
    `설명·피드백·교정 힌트는 반드시 ${nativeLangName}로 작성한다.`,
    `실제 연습 대화(상황극, 문장 연습)는 ${targetLangName}로 진행한다.`,
    `두 언어를 혼용할 때는 목적을 명확히 구분한다 (설명=모국어, 연습=학습어).`,
    '',
    // ── 교정 + 학습 업데이트 JSON 규칙 ───────────────────────────────────────
    `[JSON 출력 규칙 — 답변 맨 끝에만]`,
    `아래 두 JSON 블록을 필요할 때만 답변 맨 끝에 추가한다:`,
    '',
    `① 교정이 필요할 때 (문법/표현 실수):`,
    `   {"corrected": "<교정된 문장>", "feedback": "<${nativeLangName}로 짧은 원어민 팁>"}`,
    `   예: {"corrected": "食べました", "feedback": "과거형은 ~ました!"}`,
    '',
    `② 새 단어·표현·주제·단계를 처음 소개할 때:`,
    `   {"_learn": {"topics": ["주제명"], "items": ["표현[발음]"], "weakPoints": ["반복 실수"], "stage": <단계번호>}}`,
    `   예: {"_learn": {"topics": ["카페 주문"], "items": ["ください[kudasai]", "~一つ[hitotsu]"], "stage": 2}}`,
    `   - topics/items/weakPoints/stage 중 해당하는 항목만 포함한다 (전부 필수 아님).`,
    `   - 이미 배운 항목이면 _learn 블록 생략.`,
    '',
    // ── 최근 대화 컨텍스트 ────────────────────────────────────────────────────
    `[최근 대화 기록 (최근 8개 — API 비용 절감)]`,
    formatRecentMessages(input.recentMessages)
  ].join('\n');
}
