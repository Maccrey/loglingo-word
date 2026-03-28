Learning datasets are grouped by learning language.

## Supported Languages

- App language: `ko`, `en`, `ja`, `zh`, `de`
- Learning language: `ko`, `en`, `ja`, `zh`, `de`

## Folder Layout

- `en/`: English learning data
- `ja/`: Japanese learning data
- `ko/`: Korean learning data
- `zh/`: Chinese learning data
- `de/`: German learning data

## Required Files Per Level

For every new language-level pair, create both files:

1. Curriculum file
2. Sentence assembly file

For every supported learning language level, the target count is:

- `200` sentence assembly exercises per level
- Enough curriculum units and words to support those `200` exercises without relying on another language as the source of truth

Filename rules:

- English and German CEFR: `cefr-a1.json`, `cefr-a1-sentence-expansion.json`
- Japanese JLPT: `jlpt-n5.json`, `jlpt-n5-sentence-expansion.json`
- Korean TOPIK: `topik-1.json`, `topik-1-sentence-expansion.json`
- Chinese HSK: `hsk-1.json`, `hsk-1-sentence-expansion.json`

## Level Mapping

- `ko`: `topik_1` to `topik_6`
- `en`: `cefr_a1` to `cefr_c2`
- `ja`: `jlpt_n5` to `jlpt_n1`
- `zh`: `hsk_1` to `hsk_6`
- `de`: `cefr_a1` to `cefr_c2`

Use the exact `standardLevel` string from `packages/shared/src/learning-preferences.ts`.

## Curriculum JSON Structure

Each curriculum file is an array of units.

```json
[
  {
    "id": "cefr-a1-people",
    "language": "en",
    "standardLevel": "cefr_a1",
    "level": 1,
    "order": 1,
    "title": "People",
    "words": [
      {
        "id": "i",
        "term": "I",
        "meaning": "나",
        "example": "I am ready.",
        "reading": "Optional",
        "partOfSpeech": "pronoun",
        "quiz": {
          "distractors": ["you", "we", "they"]
        },
        "writing": {
          "prompt": "Write the word for 나.",
          "answer": "I",
          "accepted": ["I"],
          "script": "mixed"
        }
      }
    ]
  }
]
```

Required rules:

- `language` must match the folder language.
- `standardLevel` must match the file level.
- `level` is the internal sequence number used by the app.
- `quiz.distractors` must not duplicate the correct answer.
- `writing` should be included when the level supports writing mode.
- For languages that need pronunciation support in the UI, author `reading` with a recognized standard romanization or phonetic notation.
- Required pronunciation standards by learning language:
  - `ja`: standard kana reading for the authored surface form. Do not invent ad hoc romaji as the primary `reading` value.
  - `zh`: standard Hanyu Pinyin with tone marks where possible.
  - `ko`: standard Revised Romanization of Korean.
  - `en`: IPA pronunciation is recommended for curriculum words.
  - `de`: `reading` is optional and should only be added when there is a strong product reason.
- Curriculum words should be the source vocabulary for sentence assembly.
- Do not design sentence datasets first and backfill the vocabulary later.

## Sentence Assembly JSON Structure

Each sentence assembly file is an array of exercises.

```json
[
  {
    "id": "cefr-a1-travel-001",
    "language": "en",
    "level": "cefr_a1",
    "title": "Go Practice 001",
    "description": "Build a simple sentence step by step.",
    "stages": [
      {
        "id": "cefr-travel-1-stage-1",
        "title": "Step 1",
        "goal": "I go.",
        "goalSegments": ["I ", "go."],
        "goalTranslations": {
          "ko": {
            "text": "나는 간다.",
            "segments": ["나는 ", "간다."],
            "segmentBlockIndexes": [0, 1]
          },
          "en": {
            "text": "I go.",
            "segments": ["I ", "go."],
            "segmentBlockIndexes": [0, 1]
          },
          "ja": {
            "text": "私は行きます。",
            "segments": ["私は", "行きます。"],
            "segmentBlockIndexes": [0, 1]
          },
          "zh": {
            "text": "我去。",
            "segments": ["我", "去。"],
            "segmentBlockIndexes": [0, 1]
          },
          "de": {
            "text": "Ich gehe.",
            "segments": ["Ich ", "gehe."],
            "segmentBlockIndexes": [0, 1]
          }
        },
        "focus": "subject + verb",
        "selectionAdvice": "Start with the subject and verb.",
        "completionAdvice": "Basic sentence done.",
        "correctBlocks": [
          { "id": "b1", "text": "I" },
          { "id": "b2", "text": "go." }
        ],
        "distractorBlocks": [
          { "id": "d1", "text": "to school", "advice": "The place comes later." },
          { "id": "d2", "text": "come.", "advice": "Use go, not come." }
        ]
      }
    ]
  }
]
```

Required rules:

- Author the source sentence data in the learning language only.
- `title`, `description`, `focus`, `goal`, `goalSegments`, `selectionAdvice`, `completionAdvice`, `correctBlocks`, and distractor `advice` must be authored from the perspective of the learning language.
- `goal` and `goalSegments` must follow the learning language word order.
- `correctBlocks` must also follow the learning language word order.
- If the learning language normally places time or adverbial phrases later in the sentence, keep that natural order in `goal`, `goalSegments`, and `correctBlocks`.
- Do not force all languages into a single template such as `time + subject + verb + object`.
- App-language display data is generated output, not the authoring source of truth.
- When generating the final runtime artifact, `goalTranslations` must contain all five app languages: `ko`, `en`, `ja`, `zh`, `de`.
- Generated `goalTranslations` should be natural in each app language.
- Do not mirror the learning-language block order into translation text when that order is unnatural.
- Generated `goalTranslations.text` must be a natural sentence in the app language, even when the learning language uses a different word order.
- Generated `goalTranslations.segments` may be grouped for readable display.
- Generated `goalTranslations.segmentBlockIndexes` must map each displayed segment to the learning-language block index it represents.
- When display order differs from answer order, `segmentBlockIndexes` must preserve the correct link to the source block.
- Example:
  - Japanese blocks: `["友だちは", "うちに", "行きます。"]`
  - English target sentence: `My friend go home.`
  - This is invalid.
  - Correct English target sentence: `My friend goes home.` or in this app's simplified pattern `My friend go home.` must be avoided in authored data.
- `selectionAdvice`, `completionAdvice`, and distractor `advice` should be written in the learning language used by the exercise.
- If the learning language requires pronunciation support in the product, keep sentence blocks and curriculum words aligned so the runtime can display the same standardized `reading` consistently.
- Each level should use that same level's curriculum vocabulary as the base.
- Inflection, particles, auxiliaries, and fixed grammar blocks may be added when needed, but do not import core content words from a different level or different language.
- Distractor texts must be unique within the current turn.

## Translation Config

Sentence target translation must be controlled by shared data, not by adding a new formatter function for each language.

- Shared config file: `_meta/sentence-translation-config.json`
- Add or update source-language role mapping in `sourceRoleProfiles`
- Add or update app-language output order in `targetSentencePatterns`
- Add or update target wording in `targetLexicon`
- Avoid routine branches such as `if (sourceLanguage === 'xx')` when adding a language
- If a language really needs a new grammatical role, extend the shared role model first and then update generator/runtime code once
- Do not manually author app-language sentence order, highlight segments, or advice variants inside each learning-language dataset file unless the generator cannot express them

## Localization Rules

To avoid setting mismatches:

- Learning content language is controlled by `language` and `level`.
- UI language is controlled by app locale settings.
- Sentence assembly must always judge answers by the learning-language block order.
- `goalTranslations` are for display support only; they must not redefine the answer order.
- If the learning language and app language use different syntax, do not generate `goalTranslations` by simply concatenating translated blocks.
- Use the shared role profile and target sentence pattern data, or author the translated sentence manually.
- UI highlighting in the target sentence must follow `segmentBlockIndexes`, not the visible word order.
- Advice shown in the UI should be rendered in the current app language, but the source dataset should still author the canonical advice in the learning language.

## Pronunciation Rules

Use one pronunciation convention per learning language and stay consistent across all levels.

- `ja`: `reading` must be standard kana that matches the displayed term or block. If the term is already kana-only, `reading` may match the term exactly.
- `zh`: `reading` must be standard Hanyu Pinyin. Prefer tone marks such as `nǐ hǎo` over tone numbers such as `ni3 hao3` unless an input-method constraint makes tone numbers necessary across the whole dataset.
- `ko`: `reading` must be standard Revised Romanization such as `annyeonghaseyo`. Do not mix Revised Romanization with McCune-Reischauer or ad hoc spellings.
- `en`: `reading` should use IPA such as `/tiːtʃər/`. Do not mix IPA with ad hoc respellings such as `tee-cher`.
- `de`: do not add broad phonetic spellings by default. If pronunciation support is needed later, define one standard first and document it in the language README before generating data.

When generating new datasets:

- Do not mix multiple pronunciation standards in one file or one language folder.
- Do not leave `reading` partially populated for one level if the UI expects pronunciation support for that language.
- If a source word or sentence block changes, update its `reading` in the same change.

## Integration Checklist

When adding a new language-level dataset:

1. Add the curriculum JSON file under the correct language folder.
2. Add the sentence assembly JSON file under the correct language folder.
3. Import the curriculum file in `services/core/src/curriculum.ts`.
4. Import the sentence assembly file in `packages/shared/src/sentence-expansion.ts`.
5. Ensure the level exists in `packages/shared/src/learning-preferences.ts`.
6. Add or update shared translation config in `packages/shared/src/data/_meta/sentence-translation-config.json`.
7. Ensure sentence exercises count is `200` for the level.
8. Verify sentence blocks are based on that level's curriculum vocabulary plus allowed grammar/support blocks.
9. If app UI should fully localize, add locale resources in `locales/`.
10. Run relevant tests and typecheck.
