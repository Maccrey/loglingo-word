export type LocaleMessages = Record<string, string>;

export type TranslateInput = {
  key: string;
  localeMessages: LocaleMessages;
  fallbackMessages?: LocaleMessages;
};

export function translate(input: TranslateInput): string {
  const directMatch = input.localeMessages[input.key];

  if (directMatch) {
    return directMatch;
  }

  const fallbackMatch = input.fallbackMessages?.[input.key];

  if (fallbackMatch) {
    return fallbackMatch;
  }

  return input.key;
}
