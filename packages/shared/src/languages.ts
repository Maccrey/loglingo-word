export type SupportedLanguage = {
  code: string;
  nativeLabel: string;
  englishLabel: string;
};

export const supportedLanguages: SupportedLanguage[] = [
  { code: 'ko', nativeLabel: '한국어', englishLabel: 'Korean' },
  { code: 'en', nativeLabel: '영어', englishLabel: 'English' },
  { code: 'ja', nativeLabel: '일본어', englishLabel: 'Japanese' },
  { code: 'es', nativeLabel: '스페인어', englishLabel: 'Spanish' }
];

export function isSupportedLanguage(code: string): boolean {
  return supportedLanguages.some((language) => language.code === code);
}

export function canPairLanguages(
  nativeLanguage: string,
  targetLanguage: string
): boolean {
  return (
    isSupportedLanguage(nativeLanguage) &&
    isSupportedLanguage(targetLanguage) &&
    nativeLanguage !== targetLanguage
  );
}
