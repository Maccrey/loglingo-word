const fs = require('fs');
let content = fs.readFileSync('/Users/maccrey/Development/Loglingo_word/Tasklist.md', 'utf8');
content = content.replace(/### T3-([1-6])[\s\S]*?- 상태: \[ \] 미완료/g, match => match.replace('[ ] 미완료', '[x] 완료'));
fs.writeFileSync('/Users/maccrey/Development/Loglingo_word/Tasklist.md', content, 'utf8');
