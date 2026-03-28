## Chinese Data Guide

Use this folder for Chinese learning datasets.

### Supported Levels

- `hsk_1`
- `hsk_2`
- `hsk_3`
- `hsk_4`
- `hsk_5`
- `hsk_6`

### Files To Create Per Level

- Curriculum: `hsk-1.json`
- Sentence assembly: `hsk-1-sentence-expansion.json`

Repeat the same pattern for every HSK level.

Target output for every Chinese level:

- `200` sentence assembly exercises per level
- Sentences built primarily from that level's Chinese curriculum words

### Authoring Rules

- `language` must always be `"zh"`.
- `standardLevel` must match the file level such as `"hsk_1"`.
- Source authoring must stay in Chinese. Do not author English, Korean, Japanese, or German sentence variants as the source data.
- `goal`, `goalSegments`, and `correctBlocks` must follow natural Chinese word order.
- `selectionAdvice`, `completionAdvice`, and distractor `advice` should be written in Chinese.
- Use level vocabulary from the matching HSK curriculum file as the base for sentence blocks.
- Aspect markers, measure words, and function words may be added when needed, but core content words should stay inside the same HSK level.
- App-language translations and highlight structures are generated artifacts, not the authoring target.
- When Chinese is added as a learning language, extend the shared `_meta/sentence-translation-config.json` data instead of adding a Chinese-only formatter.

### Curriculum Notes

- If pinyin support is added later, keep source words stable so pronunciation data can be attached cleanly.
- Distractors should teach common beginner confusions such as measure words, aspect markers, or similar verbs.
- Writing metadata should be designed so simplified Chinese input is unambiguous.

### Sentence Assembly Notes

- Keep stage progression focused on Chinese syntax such as time placement, adverb position, and verb-object order.
- Translation text must be natural in the app language and must not overwrite the Chinese answer order.
- Do not manually maintain per-app-language sentence structures in this file. The generator should derive them from the Chinese source blocks.
