import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/ko/topik-1-sentence-expansion.json'
);

const subjects = [
  { id: 'na', block: '나는', title: '나' },
  { id: 'uri', block: '우리는', title: '우리' },
  { id: 'chingu', block: '친구는', title: '친구' },
  { id: 'seonsaengnim', block: '선생님은', title: '선생님' },
  { id: 'haksaeng', block: '학생은', title: '학생' }
];

const times = [
  { id: 'oneul', block: '오늘', title: '오늘' },
  { id: 'naeil', block: '내일', title: '내일' },
  { id: 'maeil', block: '매일', title: '매일' },
  { id: 'achim', block: '아침에', title: '아침에' }
];

const places = [
  { id: 'hakgyo', block: '학교에', title: '학교' },
  { id: 'jip', block: '집에', title: '집' },
  { id: 'gage', block: '가게에', title: '가게' }
];

const objectPatterns = [
  {
    id: 'mul-masida',
    objectBlock: '물을',
    objectTitle: '물',
    verbBlock: '마셔요.',
    verbTitle: '마시기',
    altObject: '차를',
    altObjectAdvice: '여기서는 차보다 물이 맞습니다.',
    altVerb: '먹어요.',
    altVerbAdvice: '여기서는 먹다가 아니라 마시다입니다.'
  },
  {
    id: 'cha-masida',
    objectBlock: '차를',
    objectTitle: '차',
    verbBlock: '마셔요.',
    verbTitle: '마시기',
    altObject: '물을',
    altObjectAdvice: '여기서는 물보다 차가 맞습니다.',
    altVerb: '먹어요.',
    altVerbAdvice: '여기서는 먹다가 아니라 마시다입니다.'
  },
  {
    id: 'ppang-meokda',
    objectBlock: '빵을',
    objectTitle: '빵',
    verbBlock: '먹어요.',
    verbTitle: '먹기',
    altObject: '책을',
    altObjectAdvice: '여기서는 책이 아니라 빵이 맞습니다.',
    altVerb: '읽어요.',
    altVerbAdvice: '여기서는 읽다가 아니라 먹다입니다.'
  },
  {
    id: 'chaek-ilkda',
    objectBlock: '책을',
    objectTitle: '책',
    verbBlock: '읽어요.',
    verbTitle: '읽기',
    altObject: '빵을',
    altObjectAdvice: '여기서는 빵이 아니라 책이 맞습니다.',
    altVerb: '먹어요.',
    altVerbAdvice: '여기서는 먹다가 아니라 읽다입니다.'
  },
  {
    id: 'ireum-sseuda',
    objectBlock: '이름을',
    objectTitle: '이름',
    verbBlock: '써요.',
    verbTitle: '쓰기',
    altObject: '책을',
    altObjectAdvice: '여기서는 책이 아니라 이름이 맞습니다.',
    altVerb: '읽어요.',
    altVerbAdvice: '여기서는 읽다가 아니라 쓰다입니다.'
  }
];

const comePlaces = [
  {
    id: 'jip-wayo',
    placeBlock: '집에',
    placeTitle: '집',
    altPlace: '가게에',
    altPlaceAdvice: '여기서는 가게가 아니라 집이 맞습니다.'
  },
  {
    id: 'gage-wayo',
    placeBlock: '가게에',
    placeTitle: '가게',
    altPlace: '집에',
    altPlaceAdvice: '여기서는 집이 아니라 가게가 맞습니다.'
  }
];

function makeId(prefix, order, stage) {
  return `${prefix}-${order}-stage-${stage}`;
}

function createTravelExercise(subject, time, place, order) {
  const altPlace = places.find((item) => item.block !== place.block)?.block ?? '집에';

  return {
    id: `topik-1-travel-${String(order).padStart(3, '0')}`,
    language: 'ko',
    level: 'topik_1',
    title: `${subject.title} ${place.title} 가기 ${String(order).padStart(3, '0')}`,
    description: 'TOPIK 1 이동 문장을 단계별로 조립합니다.',
    stages: [
      {
        id: makeId('topik-travel', order, 1),
        title: '1단계',
        goal: `${subject.block} 가요.`,
        goalSegments: [`${subject.block} `, '가요.'],
        focus: '주어 + 동사',
        selectionAdvice: '주어와 동사를 먼저 맞추세요.',
        completionAdvice: '기본 문장을 만들었습니다.',
        correctBlocks: [
          { id: `topik-travel-${order}-s1-b1`, text: subject.block },
          { id: `topik-travel-${order}-s1-b2`, text: '가요.' }
        ],
        distractorBlocks: [
          {
            id: `topik-travel-${order}-s1-d1`,
            text: place.block,
            advice: '장소는 다음 단계에서 붙습니다.'
          },
          {
            id: `topik-travel-${order}-s1-d2`,
            text: '와요.',
            advice: '여기서는 오다가 아니라 가다입니다.'
          }
        ]
      },
      {
        id: makeId('topik-travel', order, 2),
        title: '2단계',
        goal: `${subject.block} ${place.block} 가요.`,
        goalSegments: [`${subject.block} `, `${place.block} `, '가요.'],
        focus: '주어 + 장소 + 동사',
        selectionAdvice: '장소를 넣어 문장을 넓히세요.',
        completionAdvice: '장소까지 붙였습니다.',
        correctBlocks: [
          { id: `topik-travel-${order}-s2-b1`, text: subject.block },
          { id: `topik-travel-${order}-s2-b2`, text: place.block },
          { id: `topik-travel-${order}-s2-b3`, text: '가요.' }
        ],
        distractorBlocks: [
          {
            id: `topik-travel-${order}-s2-d1`,
            text: altPlace,
            advice: '여기서는 다른 장소가 아니라 목표 장소가 맞습니다.'
          },
          {
            id: `topik-travel-${order}-s2-d2`,
            text: '와요.',
            advice: '여기서는 오다가 아니라 가다입니다.'
          }
        ]
      },
      {
        id: makeId('topik-travel', order, 3),
        title: '3단계',
        goal: `${time.block} ${subject.block} ${place.block} 가요.`,
        goalSegments: [`${time.block} `, `${subject.block} `, `${place.block} `, '가요.'],
        focus: '시간 + 주어 + 장소 + 동사',
        selectionAdvice: '문장 앞에 시간 표현을 붙이세요.',
        completionAdvice: '시간까지 포함한 문장을 완성했습니다.',
        correctBlocks: [
          { id: `topik-travel-${order}-s3-b1`, text: time.block },
          { id: `topik-travel-${order}-s3-b2`, text: subject.block },
          { id: `topik-travel-${order}-s3-b3`, text: place.block },
          { id: `topik-travel-${order}-s3-b4`, text: '가요.' }
        ],
        distractorBlocks: [
          {
            id: `topik-travel-${order}-s3-d1`,
            text: '지금',
            advice: '여기서는 정해진 시간 표현을 써야 합니다.'
          },
          {
            id: `topik-travel-${order}-s3-d2`,
            text: altPlace,
            advice: '장소를 바꾸면 목표 문장이 달라집니다.'
          }
        ]
      }
    ]
  };
}

function createObjectExercise(subject, time, pattern, order) {
  return {
    id: `topik-1-object-${String(order).padStart(3, '0')}`,
    language: 'ko',
    level: 'topik_1',
    title: `${subject.title} ${pattern.objectTitle} ${pattern.verbTitle} ${String(order).padStart(3, '0')}`,
    description: 'TOPIK 1 목적어 문장을 단계별로 조립합니다.',
    stages: [
      {
        id: makeId('topik-object', order, 1),
        title: '1단계',
        goal: `${subject.block} ${pattern.verbBlock}`,
        goalSegments: [`${subject.block} `, pattern.verbBlock],
        focus: '주어 + 동사',
        selectionAdvice: '주어와 동사를 먼저 맞추세요.',
        completionAdvice: '기본 문장을 만들었습니다.',
        correctBlocks: [
          { id: `topik-object-${order}-s1-b1`, text: subject.block },
          { id: `topik-object-${order}-s1-b2`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          {
            id: `topik-object-${order}-s1-d1`,
            text: pattern.objectBlock,
            advice: '목적어는 다음 단계에서 붙습니다.'
          },
          {
            id: `topik-object-${order}-s1-d2`,
            text: pattern.altVerb,
            advice: pattern.altVerbAdvice
          }
        ]
      },
      {
        id: makeId('topik-object', order, 2),
        title: '2단계',
        goal: `${subject.block} ${pattern.objectBlock} ${pattern.verbBlock}`,
        goalSegments: [`${subject.block} `, `${pattern.objectBlock} `, pattern.verbBlock],
        focus: '주어 + 목적어 + 동사',
        selectionAdvice: '목적어를 붙여 문장을 완성하세요.',
        completionAdvice: '목적어까지 포함했습니다.',
        correctBlocks: [
          { id: `topik-object-${order}-s2-b1`, text: subject.block },
          { id: `topik-object-${order}-s2-b2`, text: pattern.objectBlock },
          { id: `topik-object-${order}-s2-b3`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          {
            id: `topik-object-${order}-s2-d1`,
            text: pattern.altObject,
            advice: pattern.altObjectAdvice
          },
          {
            id: `topik-object-${order}-s2-d2`,
            text: pattern.altVerb,
            advice: pattern.altVerbAdvice
          }
        ]
      },
      {
        id: makeId('topik-object', order, 3),
        title: '3단계',
        goal: `${time.block} ${subject.block} ${pattern.objectBlock} ${pattern.verbBlock}`,
        goalSegments: [`${time.block} `, `${subject.block} `, `${pattern.objectBlock} `, pattern.verbBlock],
        focus: '시간 + 주어 + 목적어 + 동사',
        selectionAdvice: '문장 앞에 시간 표현을 붙이세요.',
        completionAdvice: '시간까지 포함한 문장을 완성했습니다.',
        correctBlocks: [
          { id: `topik-object-${order}-s3-b1`, text: time.block },
          { id: `topik-object-${order}-s3-b2`, text: subject.block },
          { id: `topik-object-${order}-s3-b3`, text: pattern.objectBlock },
          { id: `topik-object-${order}-s3-b4`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          {
            id: `topik-object-${order}-s3-d1`,
            text: '지금',
            advice: '여기서는 정해진 시간 표현을 써야 합니다.'
          },
          {
            id: `topik-object-${order}-s3-d2`,
            text: pattern.altObject,
            advice: pattern.altObjectAdvice
          }
        ]
      }
    ]
  };
}

function createComeExercise(subject, time, pattern, order) {
  return {
    id: `topik-1-come-${String(order).padStart(3, '0')}`,
    language: 'ko',
    level: 'topik_1',
    title: `${subject.title} ${pattern.placeTitle} 오기 ${String(order).padStart(3, '0')}`,
    description: 'TOPIK 1 오다 문장을 단계별로 조립합니다.',
    stages: [
      {
        id: makeId('topik-come', order, 1),
        title: '1단계',
        goal: `${subject.block} 와요.`,
        goalSegments: [`${subject.block} `, '와요.'],
        focus: '주어 + 동사',
        selectionAdvice: '주어와 동사를 먼저 맞추세요.',
        completionAdvice: '기본 문장을 만들었습니다.',
        correctBlocks: [
          { id: `topik-come-${order}-s1-b1`, text: subject.block },
          { id: `topik-come-${order}-s1-b2`, text: '와요.' }
        ],
        distractorBlocks: [
          {
            id: `topik-come-${order}-s1-d1`,
            text: pattern.placeBlock,
            advice: '장소는 다음 단계에서 붙습니다.'
          },
          {
            id: `topik-come-${order}-s1-d2`,
            text: '가요.',
            advice: '여기서는 가다가 아니라 오다입니다.'
          }
        ]
      },
      {
        id: makeId('topik-come', order, 2),
        title: '2단계',
        goal: `${subject.block} ${pattern.placeBlock} 와요.`,
        goalSegments: [`${subject.block} `, `${pattern.placeBlock} `, '와요.'],
        focus: '주어 + 장소 + 동사',
        selectionAdvice: '장소를 붙여 문장을 넓히세요.',
        completionAdvice: '장소까지 붙였습니다.',
        correctBlocks: [
          { id: `topik-come-${order}-s2-b1`, text: subject.block },
          { id: `topik-come-${order}-s2-b2`, text: pattern.placeBlock },
          { id: `topik-come-${order}-s2-b3`, text: '와요.' }
        ],
        distractorBlocks: [
          {
            id: `topik-come-${order}-s2-d1`,
            text: pattern.altPlace,
            advice: pattern.altPlaceAdvice
          },
          {
            id: `topik-come-${order}-s2-d2`,
            text: '가요.',
            advice: '여기서는 가다가 아니라 오다입니다.'
          }
        ]
      },
      {
        id: makeId('topik-come', order, 3),
        title: '3단계',
        goal: `${time.block} ${subject.block} ${pattern.placeBlock} 와요.`,
        goalSegments: [`${time.block} `, `${subject.block} `, `${pattern.placeBlock} `, '와요.'],
        focus: '시간 + 주어 + 장소 + 동사',
        selectionAdvice: '문장 앞에 시간 표현을 붙이세요.',
        completionAdvice: '시간까지 포함한 문장을 완성했습니다.',
        correctBlocks: [
          { id: `topik-come-${order}-s3-b1`, text: time.block },
          { id: `topik-come-${order}-s3-b2`, text: subject.block },
          { id: `topik-come-${order}-s3-b3`, text: pattern.placeBlock },
          { id: `topik-come-${order}-s3-b4`, text: '와요.' }
        ],
        distractorBlocks: [
          {
            id: `topik-come-${order}-s3-d1`,
            text: '지금',
            advice: '여기서는 정해진 시간 표현을 써야 합니다.'
          },
          {
            id: `topik-come-${order}-s3-d2`,
            text: pattern.altPlace,
            advice: pattern.altPlaceAdvice
          }
        ]
      }
    ]
  };
}

const exercises = [];

for (const subject of subjects) {
  for (const time of times) {
    for (const place of places) {
      exercises.push(createTravelExercise(subject, time, place, exercises.length + 1));
    }
  }
}

for (const subject of subjects) {
  for (const time of times) {
    for (const pattern of objectPatterns) {
      exercises.push(createObjectExercise(subject, time, pattern, exercises.length + 1));
    }
  }
}

for (const subject of subjects) {
  for (const time of times) {
    for (const pattern of comePlaces) {
      exercises.push(createComeExercise(subject, time, pattern, exercises.length + 1));
    }
  }
}

if (exercises.length !== 200) {
  throw new Error(`Expected 200 TOPIK 1 sentence exercises, got ${exercises.length}`);
}

await fs.writeFile(outputPath, `${JSON.stringify(exercises, null, 2)}\n`);
console.log(`Generated ${exercises.length} TOPIK 1 sentence exercises.`);
