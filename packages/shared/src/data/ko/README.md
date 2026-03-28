## Korean Data Guide

Use this folder for Korean learning datasets.

### Supported Levels

- `topik_1`
- `topik_2`
- `topik_3`
- `topik_4`
- `topik_5`
- `topik_6`

### Files To Create Per Level

- Curriculum: `topik-1.json`
- Sentence assembly: `topik-1-sentence-expansion.json`

Repeat the same pattern for every TOPIK level.

Target output for every Korean level:

- `200` sentence assembly exercises per level
- Sentences built primarily from that level's Korean curriculum words

### Authoring Rules

- `language` must always be `"ko"`.
- `standardLevel` must match the file level such as `"topik_1"`.
- Source authoring must stay in Korean. Do not author English, Japanese, Chinese, or German sentence variants as the source data.
- `goal`, `goalSegments`, and `correctBlocks` must follow natural Korean word order.
- `selectionAdvice`, `completionAdvice`, and distractor `advice` should be written in Korean.
- If `reading` is included, it must use standard Revised Romanization of Korean.
- Do not mix Revised Romanization with McCune-Reischauer, Yale, or ad hoc spellings in the same dataset.
- Use level vocabulary from the matching TOPIK curriculum file as the base for sentence blocks.
- 조사, 어미, 보조 표현, 높임 표현은 필요 시 추가할 수 있지만 핵심 내용어는 같은 TOPIK 레벨 안에서 유지하세요.
- App-language translations and highlight structures are generated artifacts, not the authoring target.
- When Korean is added as a learning language, extend the shared `_meta/sentence-translation-config.json` data instead of adding a Korean-only formatter.

### Curriculum Notes

- Add `partOfSpeech` when it helps level progression.
- Add `reading` when the product needs pronunciation support, and keep it in standard Revised Romanization.
- Include `writing` metadata when spelling or 받아쓰기 should be trained.
- Quiz distractors should be close enough to teach distinctions in 조사, 높임, 활용, or 의미.

### Sentence Assembly Notes

- Stage order should reflect Korean grammar growth, not literal translation order from another language.
- Use concise advice that points learners to particles, endings, tense, or honorific choice.
- Do not manually maintain per-app-language sentence structures in this file. The generator should derive them from the Korean source blocks.
