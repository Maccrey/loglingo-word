import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const curriculumPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/zh/hsk-1.json'
);
const sentencePath = path.resolve(
  __dirname,
  '../packages/shared/src/data/zh/hsk-1-sentence-expansion.json'
);

const curriculum = [
  {
    id: 'hsk-1-people',
    language: 'zh',
    standardLevel: 'hsk_1',
    level: 1,
    order: 1,
    title: '基础人物',
    words: [
      word('wo', '我', 'wǒ', '나', '我是学生。', 'pronoun', ['你', '我们', '老师']),
      word('ni', '你', 'nǐ', '너', '你是老师吗？', 'pronoun', ['我', '我们', '学生']),
      word('women', '我们', 'wǒmen', '우리', '我们去学校。', 'pronoun', ['我', '你', '老师']),
      word('laoshi', '老师', 'lǎoshī', '선생님', '老师喝茶。', 'noun', ['学生', '朋友', '妈妈']),
      word('xuesheng', '学生', 'xuéshēng', '학생', '学生读书。', 'noun', ['老师', '朋友', '爸爸'])
    ]
  },
  {
    id: 'hsk-1-time',
    language: 'zh',
    standardLevel: 'hsk_1',
    level: 1,
    order: 2,
    title: '基础时间',
    words: [
      word('jintian', '今天', 'jīntiān', '오늘', '今天我去学校。', 'adverb', ['明天', '晚上', '每天']),
      word('mingtian', '明天', 'míngtiān', '내일', '明天他来。', 'adverb', ['今天', '早上', '每天']),
      word('meitian', '每天', 'měitiān', '매일', '我们每天学习。', 'adverb', ['今天', '明天', '晚上']),
      word('zaoshang', '早上', 'zǎoshang', '아침', '早上我喝水。', 'noun', ['晚上', '今天', '明天']),
      word('wanshang', '晚上', 'wǎnshang', '밤', '晚上他回家。', 'noun', ['早上', '今天', '明天'])
    ]
  },
  {
    id: 'hsk-1-places',
    language: 'zh',
    standardLevel: 'hsk_1',
    level: 1,
    order: 3,
    title: '基础地点',
    words: [
      word('xuexiao', '学校', 'xuéxiào', '학교', '我去学校。', 'noun', ['家', '商店', '饭店']),
      word('jia', '家', 'jiā', '집', '老师回家。', 'noun', ['学校', '商店', '饭店']),
      word('shangdian', '商店', 'shāngdiàn', '가게', '你去商店吗？', 'noun', ['学校', '家', '饭店']),
      word('chezhan', '车站', 'chēzhàn', '역', '我们去车站。', 'noun', ['学校', '家', '商店'])
    ]
  },
  {
    id: 'hsk-1-actions',
    language: 'zh',
    standardLevel: 'hsk_1',
    level: 1,
    order: 4,
    title: '基础动作',
    words: [
      word('qu', '去', 'qù', '가다', '我去学校。', 'verb', ['来', '喝', '吃']),
      word('xiang', '想', 'xiǎng', '원하다', '我想喝茶。', 'verb', ['去', '吃', '写']),
      word('he', '喝', 'hē', '마시다', '你喝水吗？', 'verb', ['吃', '读', '写']),
      word('chi', '吃', 'chī', '먹다', '他吃米饭。', 'verb', ['喝', '读', '写']),
      word('du', '读', 'dú', '읽다', '学生读书。', 'verb', ['写', '吃', '喝']),
      word('xie', '写', 'xiě', '쓰다', '我写名字。', 'verb', ['读', '吃', '喝'])
    ]
  },
  {
    id: 'hsk-1-objects',
    language: 'zh',
    standardLevel: 'hsk_1',
    level: 1,
    order: 5,
    title: '基础对象',
    words: [
      word('shui', '水', 'shuǐ', '물', '我喝水。', 'noun', ['茶', '米饭', '书']),
      word('cha', '茶', 'chá', '차', '老师喝茶。', 'noun', ['水', '米饭', '名字']),
      word('mifan', '米饭', 'mǐfàn', '밥', '他吃米饭。', 'noun', ['面包', '书', '茶']),
      word('shu', '书', '书', '책', '学生读书。', 'noun', ['水', '茶', '米饭']),
      word('mingzi', '名字', 'míngzi', '이름', '我写名字。', 'noun', ['书', '茶', '水'])
    ]
  }
];

const subjects = [
  { id: 'wo', block: '我', concept: '我' },
  { id: 'ni', block: '你', concept: '你' },
  { id: 'women', block: '我们', concept: '我们' },
  { id: 'laoshi', block: '老师', concept: '老师' },
  { id: 'xuesheng', block: '学生', concept: '学生' }
];

const travelTimes = [
  { id: 'jintian', block: '今天' },
  { id: 'mingtian', block: '明天' },
  { id: 'meitian', block: '每天' },
  { id: 'zaoshang', block: '早上' },
  { id: 'wanshang', block: '晚上' }
];

const objectTimes = [
  { id: 'jintian', block: '今天' },
  { id: 'mingtian', block: '明天' },
  { id: 'zaoshang', block: '早上' },
  { id: 'wanshang', block: '晚上' }
];

const places = [
  { id: 'xuexiao', block: '学校' },
  { id: 'jia', block: '家' },
  { id: 'shangdian', block: '商店' },
  { id: 'chezhan', block: '车站' }
];

const objectPatterns = [
  {
    id: 'water-drink',
    objectBlock: '水',
    predicateBlock: '喝',
    desireBlock: '想喝',
    title: '喝水',
    altObjectBlock: '茶',
    altObjectAdvice: '这里要用“水”。',
    altPredicateBlock: '吃',
    altPredicateAdvice: '这里要用“喝”，不是“吃”。'
  },
  {
    id: 'tea-drink',
    objectBlock: '茶',
    predicateBlock: '喝',
    desireBlock: '想喝',
    title: '喝茶',
    altObjectBlock: '水',
    altObjectAdvice: '这里要用“茶”。',
    altPredicateBlock: '吃',
    altPredicateAdvice: '这里要用“喝”，不是“吃”。'
  },
  {
    id: 'rice-eat',
    objectBlock: '米饭',
    predicateBlock: '吃',
    desireBlock: '想吃',
    title: '吃米饭',
    altObjectBlock: '书',
    altObjectAdvice: '这里要用“米饭”。',
    altPredicateBlock: '喝',
    altPredicateAdvice: '这里要用“吃”，不是“喝”。'
  },
  {
    id: 'book-read',
    objectBlock: '书',
    predicateBlock: '读',
    desireBlock: '想读',
    title: '读书',
    altObjectBlock: '名字',
    altObjectAdvice: '这里要用“书”。',
    altPredicateBlock: '写',
    altPredicateAdvice: '这里要用“读”，不是“写”。'
  },
  {
    id: 'name-write',
    objectBlock: '名字',
    predicateBlock: '写',
    desireBlock: '想写',
    title: '写名字',
    altObjectBlock: '书',
    altObjectAdvice: '这里要用“名字”。',
    altPredicateBlock: '读',
    altPredicateAdvice: '这里要用“写”，不是“读”。'
  }
];

function word(id, term, reading, meaning, example, partOfSpeech, distractors) {
  return {
    id,
    term,
    reading,
    meaning,
    example,
    partOfSpeech,
    quiz: {
      distractors
    },
    writing: {
      prompt: `${meaning}에 맞는 중국어를 쓰세요.`,
      answer: term,
      accepted: [term],
      script: 'mixed'
    }
  };
}

function withPeriod(text) {
  return text.endsWith('。') ? text : `${text}。`;
}

function pickAlternativeTime(times, currentBlock, preferredBlock) {
  const preferred = times.find((time) => time.block === preferredBlock);

  if (preferred && preferred.block !== currentBlock) {
    return preferred;
  }

  return times.find((time) => time.block !== currentBlock) ?? times[0];
}

function pickAlternativePlace(currentBlock, preferredBlock) {
  const preferred = places.find((place) => place.block === preferredBlock);

  if (preferred && preferred.block !== currentBlock) {
    return preferred.block;
  }

  return places.find((place) => place.block !== currentBlock)?.block ?? '家';
}

function createTravelExercise(subject, time, place, order) {
  const alternateTime = pickAlternativeTime(travelTimes, time.block, '每天');
  const altPlace = pickAlternativePlace(place.block, '商店');

  return {
    id: `hsk-1-travel-${String(order).padStart(3, '0')}`,
    language: 'zh',
    level: 'hsk_1',
    title: `${place.block}练习 ${String(order).padStart(3, '0')}`,
    description: '按步骤拼出基础中文移动句子。',
    stages: [
      {
        id: `hsk-travel-${order}-stage-1`,
        title: '第1步',
        goal: `${subject.block}去。`,
        goalSegments: [subject.block, '去。'],
        focus: '主语 + 动词',
        selectionAdvice: '先选主语，再选动作。',
        completionAdvice: '基础句完成了，下一步加入地点。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s1-b1`, text: subject.block },
          { id: `hsk-travel-${order}-s1-b2`, text: '去。' }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s1-d1`, text: place.block, advice: '地点还不到这一步。' },
          { id: `hsk-travel-${order}-s1-d2`, text: '来。', advice: '这里用“去”，不用“来”。' }
        ]
      },
      {
        id: `hsk-travel-${order}-stage-2`,
        title: '第2步',
        goal: `${subject.block}去${place.block}。`,
        goalSegments: [subject.block, '去', `${place.block}。`],
        focus: '主语 + 动词 + 地点',
        selectionAdvice: '把地点放在动作后面。',
        completionAdvice: '地点完成了，下一步用想要表达。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s2-b1`, text: subject.block },
          { id: `hsk-travel-${order}-s2-b2`, text: '去' },
          { id: `hsk-travel-${order}-s2-b3`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s2-d1`, text: withPeriod(altPlace), advice: '这里要用当前目标地点。' },
          { id: `hsk-travel-${order}-s2-d2`, text: '来', advice: '这里用“去”，不用“来”。' }
        ]
      },
      {
        id: `hsk-travel-${order}-stage-3`,
        title: '第3步',
        goal: `${subject.block}想去${place.block}。`,
        goalSegments: [subject.block, '想去', `${place.block}。`],
        focus: '主语 + 想去 + 地点',
        selectionAdvice: '把“想去”放在地点前面。',
        completionAdvice: '想要表达完成了，下一步加入时间。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s3-b1`, text: subject.block },
          { id: `hsk-travel-${order}-s3-b2`, text: '想去' },
          { id: `hsk-travel-${order}-s3-b3`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s3-d1`, text: '去', advice: '这一步需要想要表达。' },
          { id: `hsk-travel-${order}-s3-d2`, text: withPeriod(altPlace), advice: '地点不能换成别的地方。' }
        ]
      },
      {
        id: `hsk-travel-${order}-stage-4`,
        title: '第4步',
        goal: `${time.block}${subject.block}去${place.block}。`,
        goalSegments: [time.block, subject.block, '去', `${place.block}。`],
        focus: '时间 + 主语 + 动词 + 地点',
        selectionAdvice: '先放时间，再拼完整句子。',
        completionAdvice: '时间完成了，下一步继续想要表达。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s4-b1`, text: time.block },
          { id: `hsk-travel-${order}-s4-b2`, text: subject.block },
          { id: `hsk-travel-${order}-s4-b3`, text: '去' },
          { id: `hsk-travel-${order}-s4-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s4-d1`, text: alternateTime.block, advice: '这里要用当前目标时间。' },
          { id: `hsk-travel-${order}-s4-d2`, text: '来', advice: '这里用“去”，不用“来”。' }
        ]
      },
      {
        id: `hsk-travel-${order}-stage-5`,
        title: '第5步',
        goal: `${time.block}${subject.block}想去${place.block}。`,
        goalSegments: [time.block, subject.block, '想去', `${place.block}。`],
        focus: '时间 + 主语 + 想去 + 地点',
        selectionAdvice: '把“想去”放在地点前。',
        completionAdvice: '当前时间的想要表达完成了。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s5-b1`, text: time.block },
          { id: `hsk-travel-${order}-s5-b2`, text: subject.block },
          { id: `hsk-travel-${order}-s5-b3`, text: '想去' },
          { id: `hsk-travel-${order}-s5-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s5-d1`, text: '去', advice: '这一步要用“想去”。' },
          { id: `hsk-travel-${order}-s5-d2`, text: alternateTime.block, advice: '这里时间不能换。' }
        ]
      },
      {
        id: `hsk-travel-${order}-stage-6`,
        title: '第6步',
        goal: `${alternateTime.block}${subject.block}去${place.block}。`,
        goalSegments: [alternateTime.block, subject.block, '去', `${place.block}。`],
        focus: '替换时间表达',
        selectionAdvice: '换成新的时间表达再拼句子。',
        completionAdvice: '替换时间完成了，最后加想要表达。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s6-b1`, text: alternateTime.block },
          { id: `hsk-travel-${order}-s6-b2`, text: subject.block },
          { id: `hsk-travel-${order}-s6-b3`, text: '去' },
          { id: `hsk-travel-${order}-s6-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s6-d1`, text: time.block, advice: '这一步要换成新的时间表达。' },
          { id: `hsk-travel-${order}-s6-d2`, text: '来', advice: '这里用“去”，不用“来”。' }
        ]
      },
      {
        id: `hsk-travel-${order}-stage-7`,
        title: '第7步',
        goal: `${alternateTime.block}${subject.block}想去${place.block}。`,
        goalSegments: [alternateTime.block, subject.block, '想去', `${place.block}。`],
        focus: '替换时间 + 想要表达',
        selectionAdvice: '用新的时间表达完成最终句子。',
        completionAdvice: '你完成了七步扩展。',
        correctBlocks: [
          { id: `hsk-travel-${order}-s7-b1`, text: alternateTime.block },
          { id: `hsk-travel-${order}-s7-b2`, text: subject.block },
          { id: `hsk-travel-${order}-s7-b3`, text: '想去' },
          { id: `hsk-travel-${order}-s7-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `hsk-travel-${order}-s7-d1`, text: time.block, advice: '这里要用新的时间表达。' },
          { id: `hsk-travel-${order}-s7-d2`, text: '去', advice: '最后一步需要“想去”。' }
        ]
      }
    ]
  };
}

function createObjectExercise(subject, time, pattern, order) {
  const alternateTime = pickAlternativeTime(objectTimes, time.block, '早上');

  return {
    id: `hsk-1-object-${String(order).padStart(3, '0')}`,
    language: 'zh',
    level: 'hsk_1',
    title: `${pattern.title}练习 ${String(order).padStart(3, '0')}`,
    description: '按步骤拼出基础中文宾语句子。',
    stages: [
      {
        id: `hsk-object-${order}-stage-1`,
        title: '第1步',
        goal: `${subject.block}${pattern.predicateBlock}${pattern.objectBlock}。`,
        goalSegments: [subject.block, pattern.predicateBlock, `${pattern.objectBlock}。`],
        focus: '主语 + 动词 + 宾语',
        selectionAdvice: '先选动作，再选宾语。',
        completionAdvice: '基础宾语句完成了。',
        correctBlocks: [
          { id: `hsk-object-${order}-s1-b1`, text: subject.block },
          { id: `hsk-object-${order}-s1-b2`, text: pattern.predicateBlock },
          { id: `hsk-object-${order}-s1-b3`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s1-d1`, text: withPeriod(pattern.altObjectBlock), advice: pattern.altObjectAdvice },
          { id: `hsk-object-${order}-s1-d2`, text: pattern.altPredicateBlock, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `hsk-object-${order}-stage-2`,
        title: '第2步',
        goal: `${time.block}${subject.block}${pattern.predicateBlock}${pattern.objectBlock}。`,
        goalSegments: [time.block, subject.block, pattern.predicateBlock, `${pattern.objectBlock}。`],
        focus: '时间 + 主语 + 动词 + 宾语',
        selectionAdvice: '把时间放到句首。',
        completionAdvice: '时间完成了，下一步加想要表达。',
        correctBlocks: [
          { id: `hsk-object-${order}-s2-b1`, text: time.block },
          { id: `hsk-object-${order}-s2-b2`, text: subject.block },
          { id: `hsk-object-${order}-s2-b3`, text: pattern.predicateBlock },
          { id: `hsk-object-${order}-s2-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s2-d1`, text: alternateTime.block, advice: '这里要用当前目标时间。' },
          { id: `hsk-object-${order}-s2-d2`, text: pattern.altPredicateBlock, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `hsk-object-${order}-stage-3`,
        title: '第3步',
        goal: `${time.block}${subject.block}${pattern.desireBlock}${pattern.objectBlock}。`,
        goalSegments: [time.block, subject.block, pattern.desireBlock, `${pattern.objectBlock}。`],
        focus: '时间 + 主语 + 想要动作 + 宾语',
        selectionAdvice: '把想要表达放在宾语前面。',
        completionAdvice: '想要表达完成了。',
        correctBlocks: [
          { id: `hsk-object-${order}-s3-b1`, text: time.block },
          { id: `hsk-object-${order}-s3-b2`, text: subject.block },
          { id: `hsk-object-${order}-s3-b3`, text: pattern.desireBlock },
          { id: `hsk-object-${order}-s3-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s3-d1`, text: pattern.predicateBlock, advice: '这一步需要想要表达。' },
          { id: `hsk-object-${order}-s3-d2`, text: withPeriod(pattern.altObjectBlock), advice: pattern.altObjectAdvice }
        ]
      },
      {
        id: `hsk-object-${order}-stage-4`,
        title: '第4步',
        goal: `${alternateTime.block}${subject.block}${pattern.predicateBlock}${pattern.objectBlock}。`,
        goalSegments: [alternateTime.block, subject.block, pattern.predicateBlock, `${pattern.objectBlock}。`],
        focus: '替换时间 + 基本动作',
        selectionAdvice: '换一个时间表达完成句子。',
        completionAdvice: '新的时间表达完成了。',
        correctBlocks: [
          { id: `hsk-object-${order}-s4-b1`, text: alternateTime.block },
          { id: `hsk-object-${order}-s4-b2`, text: subject.block },
          { id: `hsk-object-${order}-s4-b3`, text: pattern.predicateBlock },
          { id: `hsk-object-${order}-s4-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s4-d1`, text: time.block, advice: '这里要换成新的时间表达。' },
          { id: `hsk-object-${order}-s4-d2`, text: pattern.altPredicateBlock, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `hsk-object-${order}-stage-5`,
        title: '第5步',
        goal: `${alternateTime.block}${subject.block}${pattern.desireBlock}${pattern.objectBlock}。`,
        goalSegments: [alternateTime.block, subject.block, pattern.desireBlock, `${pattern.objectBlock}。`],
        focus: '替换时间 + 想要动作',
        selectionAdvice: '用新的时间表达拼出想要句。',
        completionAdvice: '继续保持同样语序。',
        correctBlocks: [
          { id: `hsk-object-${order}-s5-b1`, text: alternateTime.block },
          { id: `hsk-object-${order}-s5-b2`, text: subject.block },
          { id: `hsk-object-${order}-s5-b3`, text: pattern.desireBlock },
          { id: `hsk-object-${order}-s5-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s5-d1`, text: pattern.predicateBlock, advice: '最后一步前还需要想要表达。' },
          { id: `hsk-object-${order}-s5-d2`, text: time.block, advice: '这一步要用新的时间表达。' }
        ]
      },
      {
        id: `hsk-object-${order}-stage-6`,
        title: '第6步',
        goal: `每天${subject.block}${pattern.predicateBlock}${pattern.objectBlock}。`,
        goalSegments: ['每天', subject.block, pattern.predicateBlock, `${pattern.objectBlock}。`],
        focus: '每天 + 基本动作',
        selectionAdvice: '把“每天”放在句首。',
        completionAdvice: '每天句完成了，最后一步加想要表达。',
        correctBlocks: [
          { id: `hsk-object-${order}-s6-b1`, text: '每天' },
          { id: `hsk-object-${order}-s6-b2`, text: subject.block },
          { id: `hsk-object-${order}-s6-b3`, text: pattern.predicateBlock },
          { id: `hsk-object-${order}-s6-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s6-d1`, text: alternateTime.block, advice: '这里要用“每天”。' },
          { id: `hsk-object-${order}-s6-d2`, text: pattern.altPredicateBlock, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `hsk-object-${order}-stage-7`,
        title: '第7步',
        goal: `每天${subject.block}${pattern.desireBlock}${pattern.objectBlock}。`,
        goalSegments: ['每天', subject.block, pattern.desireBlock, `${pattern.objectBlock}。`],
        focus: '每天 + 想要动作',
        selectionAdvice: '最后用“每天”完成想要句。',
        completionAdvice: '你完成了七步扩展。',
        correctBlocks: [
          { id: `hsk-object-${order}-s7-b1`, text: '每天' },
          { id: `hsk-object-${order}-s7-b2`, text: subject.block },
          { id: `hsk-object-${order}-s7-b3`, text: pattern.desireBlock },
          { id: `hsk-object-${order}-s7-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `hsk-object-${order}-s7-d1`, text: pattern.predicateBlock, advice: '最后一步要用想要表达。' },
          { id: `hsk-object-${order}-s7-d2`, text: alternateTime.block, advice: '这里固定用“每天”。' }
        ]
      }
    ]
  };
}

const exercises = [];

for (const subject of subjects) {
  for (const time of travelTimes) {
    for (const place of places) {
      exercises.push(createTravelExercise(subject, time, place, exercises.length + 1));
    }
  }
}

for (const subject of subjects) {
  for (const time of objectTimes) {
    for (const pattern of objectPatterns) {
      exercises.push(createObjectExercise(subject, time, pattern, exercises.length + 1));
    }
  }
}

if (exercises.length !== 200) {
  throw new Error(`Expected 200 HSK 1 sentence exercises, got ${exercises.length}`);
}

await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`);
await fs.writeFile(sentencePath, `${JSON.stringify(exercises, null, 2)}\n`);
console.log(`Generated HSK 1 curriculum (${curriculum.length} units) and ${exercises.length} sentence exercises.`);
