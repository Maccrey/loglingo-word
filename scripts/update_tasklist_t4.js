const fs = require('fs');

const tp = '/Users/maccrey/Development/Loglingo_word/Tasklist.md';
let content = fs.readFileSync(tp, 'utf8');
content = content.replace(/### T4-([1-4])[\s\S]*?- 상태: \[ \] 미완료/g, match => match.replace('[ ] 미완료', '[x] 완료'));
fs.writeFileSync(tp, content, 'utf8');
