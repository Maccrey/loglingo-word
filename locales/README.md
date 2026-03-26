# Locale Key Rules

- 키는 `page.section.item` 형태의 소문자 dot notation을 사용한다.
- 구조는 `ko.json`, `en.json` 사이에 동일하게 유지한다.
- 버튼/라벨/상태 텍스트는 의미 단위로 분리하고 문장 전체를 재사용하지 않는다.
- 누락 번역은 이후 fallback 로직에서 처리하므로, 기본적으로 모든 신규 키는 두 locale에 함께 추가한다.
