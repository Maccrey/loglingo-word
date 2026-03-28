import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../packages/shared/src/data');
const translationConfigPath = path.resolve(
  dataDir,
  '_meta/sentence-translation-config.json'
);

const translationConfig = JSON.parse(
  await fs.readFile(translationConfigPath, 'utf8')
);

const {
  appLanguages,
  subjectConcepts,
  sourceRoleProfiles,
  targetSentencePatterns,
  targetLexicon
} = translationConfig;

function detectStructuredParts(sourceLanguage, blocks) {
  const profile = sourceRoleProfiles[sourceLanguage];

  if (!profile) {
    return null;
  }

  const parts = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const text = blocks[index].text;
    let matched = null;
    const candidates = text.endsWith('.') ? [text, text.slice(0, -1)] : [text];

    for (const role of ['subject', 'time', 'place', 'object', 'predicate']) {
      for (const candidate of candidates) {
        const concept = profile[role]?.[candidate];

        if (concept) {
          matched = { role, concept, sourceBlockIndex: index };
          break;
        }
      }

      if (matched) {
        break;
      }
    }

    if (!matched) {
      return null;
    }

    parts.push(matched);
  }

  return parts;
}

function buildPatternKey(parts) {
  const hasPlace = parts.some((part) => part.role === 'place');
  const hasObject = parts.some((part) => part.role === 'object');

  if (parts.length === 2) {
    return 'two';
  }

  if (parts.length === 3) {
    return hasPlace ? 'three_place' : hasObject ? 'three_object' : null;
  }

  if (parts.length === 4) {
    return hasPlace ? 'four_place' : hasObject ? 'four_object' : null;
  }

  return null;
}

function renderTargetRole(targetLanguage, role, concept, subjectConcept) {
  const lexicon = targetLexicon[targetLanguage]?.[role];

  if (!lexicon) {
    return null;
  }

  const token = lexicon[concept];

  if (!token) {
    return null;
  }

  if (
    role === 'predicate' &&
    typeof token === 'object' &&
    token !== null &&
    'base' in token
  ) {
    const agreement = subjectConcept
      ? subjectConcepts[subjectConcept]?.agreement ?? 'base'
      : 'base';

    return token[agreement] ?? token.base;
  }

  return token;
}

function ensureTerminalPunctuation(targetLanguage, segments) {
  if (segments.length === 0) {
    return segments;
  }

  const punctuated = [...segments];
  const lastIndex = punctuated.length - 1;
  const lastSegment = punctuated[lastIndex].trimEnd();

  if (/[.!?。！？]$/.test(lastSegment)) {
    punctuated[lastIndex] = lastSegment;
    return punctuated;
  }

  const suffix = targetLanguage === 'ja' || targetLanguage === 'zh' ? '。' : '.';
  punctuated[lastIndex] = `${lastSegment}${suffix}`;
  return punctuated;
}

function buildStructuredGoalTranslations(sourceLanguage, blocks) {
  const parts = detectStructuredParts(sourceLanguage, blocks);

  if (!parts) {
    return null;
  }

  const patternKey = buildPatternKey(parts);

  if (!patternKey) {
    return null;
  }

  const subjectConcept =
    parts.find((part) => part.role === 'subject')?.concept ?? null;

  const translations = {};

  for (const targetLanguage of appLanguages) {
    const roleOrder = targetSentencePatterns[targetLanguage]?.[patternKey];

    if (!roleOrder) {
      return null;
    }

    const orderedParts = roleOrder.map((role) =>
      parts.find((part) => part.role === role)
    );

    if (orderedParts.some((part) => !part)) {
      return null;
    }

    const rawSegments = orderedParts.map((part) =>
      renderTargetRole(targetLanguage, part.role, part.concept, subjectConcept)
    );

    if (rawSegments.some((segment) => !segment)) {
      return null;
    }

    const segments = ensureTerminalPunctuation(targetLanguage, rawSegments);

    translations[targetLanguage] = {
      text: segments.join(''),
      segments,
      segmentBlockIndexes: orderedParts.map((part) => part.sourceBlockIndex)
    };
  }

  return translations;
}

function buildFallbackGoalTranslations(fallbackText, fallbackSegments) {
  const translations = {};

  for (const language of appLanguages) {
    translations[language] = {
      text: fallbackText,
      segments: fallbackSegments,
      segmentBlockIndexes: fallbackSegments.map((_, index) => index)
    };
  }

  return translations;
}

async function updateFile(relativePath, sourceLanguage) {
  const filePath = path.resolve(dataDir, relativePath);
  const exercises = JSON.parse(await fs.readFile(filePath, 'utf8'));
  const localized = exercises.map((exercise) => ({
    ...exercise,
    stages: exercise.stages.map((stage) => ({
      ...stage,
      goalTranslations:
        buildStructuredGoalTranslations(sourceLanguage, stage.correctBlocks) ??
        buildFallbackGoalTranslations(stage.goal, stage.goalSegments)
    }))
  }));

  await fs.writeFile(filePath, `${JSON.stringify(localized, null, 2)}\n`);
  console.log(`Updated goal translations for ${relativePath}`);
}

const sentenceExpansionFiles = [
  { path: 'en/cefr-a1-sentence-expansion.json', sourceLanguage: 'en' },
  { path: 'ja/jlpt-n5-sentence-expansion.json', sourceLanguage: 'ja' },
  { path: 'ko/topik-1-sentence-expansion.json', sourceLanguage: 'ko' }
];

for (const entry of sentenceExpansionFiles) {
  await updateFile(entry.path, entry.sourceLanguage);
}
