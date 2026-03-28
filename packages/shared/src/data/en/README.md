## English Data Guide

Use this folder for English learning datasets.

### Supported Levels

- `cefr_a1`
- `cefr_a2`
- `cefr_b1`
- `cefr_b2`
- `cefr_c1`
- `cefr_c2`

### Files To Create Per Level

- Curriculum: `cefr-a1.json`
- Sentence assembly: `cefr-a1-sentence-expansion.json`

Repeat the same pattern for every CEFR level.

Target output for every English level:

- `200` sentence assembly exercises per level
- Sentences built primarily from that level's English curriculum words

### Authoring Rules

- `language` must always be `"en"`.
- `standardLevel` must match the file level such as `"cefr_a1"`.
- Source authoring must stay in English. Do not author Korean, Japanese, Chinese, or German sentence variants as the source data.
- `goal`, `goalSegments`, and `correctBlocks` must follow natural English word order.
- Do not write Korean-style or Japanese-style order such as `I water drink.`.
- Do not force time to the front when the sentence is more natural with time later.
- Prefer forms such as `We drink tea every day.` over `every day We drink tea.` when that is the intended learning target.
- `selectionAdvice`, `completionAdvice`, and distractor `advice` should be written in English.
- Use level vocabulary from `cefr-a1.json` as the base for sentence blocks.
- Grammar helpers such as `to school`, `every day`, or `want to go` may be added when needed, but core content words should stay inside the same CEFR level.
- App-language translations and highlight structures are generated artifacts, not the authoring target.
- For example, `at night I go home.` must not become a literal block-order translation like `밤에 나는 간다 집에.`.
- If translations are generated automatically, use the shared `_meta/sentence-translation-config.json` data rather than an English-only formatter.
- When the translated sentence order changes, set `segmentBlockIndexes` to the source English block positions.
- Example:
  - English blocks: `["We", "drink", "tea.", "every day"]`
  - Korean display segments: `["매일 ", "우리는 ", "차를 ", "마신다."]`
  - `segmentBlockIndexes`: `[3, 0, 2, 1]`

### Curriculum Notes

- Include `quiz.distractors` for multiple-choice quiz support.
- Include `writing` when writing mode should be available.
- `meaning` may be Korean today, but if multilingual gloss support is added later, keep authoring source material clean and consistent.

### Sentence Assembly Notes

- Keep stages short and progressive.
- Highlight the real English structure first.
- Use similar but distinct distractors that help learners notice tense, verb, or preposition differences.
- Do not manually maintain per-app-language sentence structures in this file. The generator should derive them from the English source blocks.
