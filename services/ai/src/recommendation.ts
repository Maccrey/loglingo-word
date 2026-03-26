export type RecommendationWindow = {
  allowed: boolean;
  currentWeekId: string;
  lastRequestedWeekId?: string;
};

export type RecommendationProgress = {
  wordId: string;
  correctStreak: number;
  storageStrength: number;
  retrievalStrength: number;
};

export type RecommendationWord = {
  id: string;
};

export type RecommendationPromptInput = {
  userId: string;
  weekId: string;
  nativeLanguage: string;
  targetLanguage: string;
  fallbackWords: string[];
};

export type RecommendationServiceInput = RecommendationPromptInput & {
  rawResponse: string;
};

function startOfUtcDay(timestamp: string): Date {
  const date = new Date(timestamp);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getWeekId(timestamp: string): string {
  const date = startOfUtcDay(timestamp);
  const day = date.getUTCDay();
  const isoDay = day === 0 ? 7 : day;
  const weekStartDate = addUtcDays(date, 1 - isoDay);
  const thursday = addUtcDays(weekStartDate, 3);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const yearStartDay = yearStart.getUTCDay();
  const yearStartIsoDay = yearStartDay === 0 ? 7 : yearStartDay;
  const firstWeekStart = addUtcDays(yearStart, 1 - yearStartIsoDay);
  const weekNumber =
    Math.floor(
      (weekStartDate.getTime() - firstWeekStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    ) + 1;

  return `${thursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export function canRequestWeeklyRecommendation(
  now: string,
  lastRequestedAt?: string
): RecommendationWindow {
  const currentWeekId = getWeekId(now);
  const lastRequestedWeekId = lastRequestedAt
    ? getWeekId(lastRequestedAt)
    : undefined;

  return lastRequestedWeekId
    ? {
        allowed: currentWeekId !== lastRequestedWeekId,
        currentWeekId,
        lastRequestedWeekId
      }
    : {
        allowed: true,
        currentWeekId
      };
}

export function getFallbackRecommendations(input: {
  progress: RecommendationProgress[];
  curriculumWordIds: string[];
  limit?: number;
}): string[] {
  const limit = input.limit ?? 3;
  const weakWords = [...input.progress]
    .sort((left, right) => {
      const leftScore =
        left.storageStrength +
        left.retrievalStrength +
        left.correctStreak * 0.2;
      const rightScore =
        right.storageStrength +
        right.retrievalStrength +
        right.correctStreak * 0.2;

      return leftScore - rightScore;
    })
    .map((item) => item.wordId);

  const selected = new Set<string>();

  for (const wordId of weakWords) {
    if (selected.size >= limit) {
      break;
    }

    selected.add(wordId);
  }

  for (const wordId of input.curriculumWordIds) {
    if (selected.size >= limit) {
      break;
    }

    selected.add(wordId);
  }

  return [...selected].slice(0, limit);
}

export function buildRecommendationPrompt(
  input: RecommendationPromptInput
): string {
  return [
    'You are selecting vocabulary recommendations for a language learner.',
    `User ID: ${input.userId}`,
    `Week ID: ${input.weekId}`,
    `Native language: ${input.nativeLanguage}`,
    `Target language: ${input.targetLanguage}`,
    `Fallback candidates: ${input.fallbackWords.join(', ')}`,
    'Return strict JSON in the form {"words":["word1","word2","word3"]}.'
  ].join('\n');
}

export function parseRecommendationResponse(rawResponse: string): string[] {
  const parsed = JSON.parse(rawResponse) as { words?: unknown };

  if (!Array.isArray(parsed.words)) {
    throw new Error('Recommendation response must include a words array.');
  }

  const words = parsed.words.filter(
    (word): word is string => typeof word === 'string' && word.trim().length > 0
  );

  if (words.length === 0) {
    throw new Error('Recommendation response did not include valid words.');
  }

  return words;
}

export function resolveRecommendationWords(input: RecommendationServiceInput): {
  words: string[];
  source: 'openai' | 'fallback';
  prompt: string;
} {
  const prompt = buildRecommendationPrompt(input);

  try {
    return {
      words: parseRecommendationResponse(input.rawResponse),
      source: 'openai',
      prompt
    };
  } catch {
    return {
      words: input.fallbackWords,
      source: 'fallback',
      prompt
    };
  }
}
