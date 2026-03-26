export const DEFAULT_CORRECTION_FEEDBACK = '문장을 더 자연스럽게 다듬었습니다.';

export type CorrectionParseResult = {
  corrected: string;
  feedback: string;
};

export function parseCorrectionResponse(
  rawResponse: string
): CorrectionParseResult {
  const parsed = JSON.parse(rawResponse) as {
    corrected?: unknown;
    feedback?: unknown;
  };

  if (
    typeof parsed.corrected !== 'string' ||
    parsed.corrected.trim().length === 0
  ) {
    throw new Error('Correction response must include a corrected sentence.');
  }

  return {
    corrected: parsed.corrected.trim(),
    feedback:
      typeof parsed.feedback === 'string' && parsed.feedback.trim().length > 0
        ? parsed.feedback.trim()
        : DEFAULT_CORRECTION_FEEDBACK
  };
}
