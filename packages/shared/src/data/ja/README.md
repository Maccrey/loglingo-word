## Japanese Data Guide

Use this folder for Japanese learning datasets.

### Supported Levels

- `jlpt_n5`
- `jlpt_n4`
- `jlpt_n3`
- `jlpt_n2`
- `jlpt_n1`

### Files To Create Per Level

- Curriculum: `jlpt-n5.json`
- Sentence assembly: `jlpt-n5-sentence-expansion.json`

Repeat the same pattern for every JLPT level.

Target output for every Japanese level:

- `200` sentence assembly exercises per level
- Sentences built primarily from that level's Japanese curriculum words

### Authoring Rules

- `language` must always be `"ja"`.
- `standardLevel` must match the file level such as `"jlpt_n5"`.
- Source authoring must stay in Japanese. Do not author English, Korean, Chinese, or German sentence variants as the source data.
- `goal`, `goalSegments`, and `correctBlocks` must follow natural Japanese word order.
- Use Japanese script intentionally:
  - `reading` for kana reading support
  - `writing.script` as `kana`, `kanji`, or `mixed`
- `reading` must use standard kana for the exact authored surface form.
- Do not use romaji as the primary `reading` field for Japanese learning data.
- If the term is already written only in kana, `reading` may match the term exactly.
- `selectionAdvice`, `completionAdvice`, and distractor `advice` should be written in Japanese if the exercise is for Japanese learning.
- Use level vocabulary from `jlpt-n5.json` as the base for sentence blocks.
- Particles, auxiliaries, politeness endings, and conjugated forms may be added when needed, but core content words should stay inside the same JLPT level.
- App-language translations and highlight structures are generated artifacts, not the authoring target.
- Do not concatenate translated Japanese blocks into English, German, or Chinese in Japanese block order.
- The same rule applies to Korean as an app language when particles or phrase order need reshaping for readability.
- If translations are generated automatically, use the shared `_meta/sentence-translation-config.json` data rather than a Japanese-only formatter.
- Example:
  - Japanese blocks: `友だちは / うちに / 行きます。`
  - Invalid English target sentence: `My friend home go.`
  - Valid English target sentence: `My friend goes home.` or the simplified app-safe order `My friend go home.` must not be used as final translation data.

### Curriculum Notes

- Include `reading` whenever kanji is present.
- When sentence blocks include kanji, keep the block wording and any linked curriculum word `reading` aligned to the same kana form.
- Include `writing` metadata for kana and kanji writing drills.
- Distractors should reflect common JLPT learner mistakes, not random unrelated words.

### Sentence Assembly Notes

- Build from short core sentences to longer clause combinations.
- Keep particles, verb forms, and politeness levels consistent within one exercise.
- Translation text should explain meaning naturally in the app language, not preserve Japanese block order mechanically.
- When target language order changes, `segmentBlockIndexes` must point back to the original Japanese block order so highlighting stays correct.
- Do not manually maintain per-app-language sentence structures in this file. The generator should derive them from the Japanese source blocks.
