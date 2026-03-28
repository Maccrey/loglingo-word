import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/ja/jlpt-n5-sentence-expansion.json'
);

const subjects = [
  { id: 'watashi', block: '私は', goal: '나는 ' },
  { id: 'tomodachi', block: '友だちは', goal: '친구는 ' },
  { id: 'sensei', block: '先生は', goal: '선생님은 ' },
  { id: 'gakusei', block: '学生は', goal: '학생은 ' }
];

const times = [
  { id: 'today', block: '今日は', goal: '오늘은 ' },
  { id: 'tomorrow', block: '明日は', goal: '내일은 ' },
  { id: 'morning', block: '朝は', goal: '아침에는 ' },
  { id: 'night', block: '夜は', goal: '밤에는 ' },
  { id: 'everyday', block: '毎日', goal: '매일 ' }
];

const places = [
  { id: 'school', block: '学校に', goal: '학교에 ' },
  { id: 'station', block: '駅に', goal: '역에 ' },
  { id: 'home', block: 'うちに', goal: '집에 ' },
  { id: 'shop', block: '店に', goal: '가게에 ' }
];

function pickAlternativePlaceBlock(currentBlock, preferredBlock) {
  const preferred = places.find((place) => place.block === preferredBlock);

  if (preferred && preferred.block !== currentBlock) {
    return preferred.block;
  }

  return places.find((place) => place.block !== currentBlock)?.block ?? '駅に';
}

const objectPatterns = [
  {
    id: 'water-drink',
    objectBlock: '水を',
    objectGoal: '물을 ',
    verbBlock: '飲みます。',
    verbGoal: '마신다.',
    desireBlock: '飲みたいです。',
    desireGoal: '마시고 싶다.',
    distractorObjectBlock: 'お茶を',
    distractorObjectAdvice: '여기서는 차보다 물이 맞습니다.',
    distractorVerbBlock: '食べます。',
    distractorVerbAdvice: '여기는 먹다가 아니라 마시다입니다.'
  },
  {
    id: 'tea-drink',
    objectBlock: 'お茶を',
    objectGoal: '차를 ',
    verbBlock: '飲みます。',
    verbGoal: '마신다.',
    desireBlock: '飲みたいです。',
    desireGoal: '마시고 싶다.',
    distractorObjectBlock: '水を',
    distractorObjectAdvice: '여기서는 물보다 차가 맞습니다.',
    distractorVerbBlock: '食べます。',
    distractorVerbAdvice: '여기는 먹다가 아니라 마시다입니다.'
  },
  {
    id: 'rice-eat',
    objectBlock: 'ごはんを',
    objectGoal: '밥을 ',
    verbBlock: '食べます。',
    verbGoal: '먹는다.',
    desireBlock: '食べたいです。',
    desireGoal: '먹고 싶다.',
    distractorObjectBlock: 'パンを',
    distractorObjectAdvice: '여기서는 빵보다 밥이 맞습니다.',
    distractorVerbBlock: '飲みます。',
    distractorVerbAdvice: '여기는 마시다가 아니라 먹다입니다.'
  },
  {
    id: 'bread-eat',
    objectBlock: 'パンを',
    objectGoal: '빵을 ',
    verbBlock: '食べます。',
    verbGoal: '먹는다.',
    desireBlock: '食べたいです。',
    desireGoal: '먹고 싶다.',
    distractorObjectBlock: 'ごはんを',
    distractorObjectAdvice: '여기서는 밥보다 빵이 맞습니다.',
    distractorVerbBlock: '飲みます。',
    distractorVerbAdvice: '여기는 마시다가 아니라 먹다입니다.'
  },
  {
    id: 'name-write',
    objectBlock: '名前を',
    objectGoal: '이름을 ',
    verbBlock: '書きます。',
    verbGoal: '쓴다.',
    desireBlock: '書きたいです。',
    desireGoal: '쓰고 싶다.',
    distractorObjectBlock: '道を',
    distractorObjectAdvice: '여기서는 길이 아니라 이름이 맞습니다.',
    distractorVerbBlock: '読みます。',
    distractorVerbAdvice: '여기는 읽다가 아니라 쓰다입니다.'
  },
  {
    id: 'name-read',
    objectBlock: '名前を',
    objectGoal: '이름을 ',
    verbBlock: '読みます。',
    verbGoal: '읽는다.',
    desireBlock: '読みたいです。',
    desireGoal: '읽고 싶다.',
    distractorObjectBlock: '道を',
    distractorObjectAdvice: '여기서는 길이 아니라 이름이 맞습니다.',
    distractorVerbBlock: '書きます。',
    distractorVerbAdvice: '여기는 쓰다가 아니라 읽다입니다.'
  },
  {
    id: 'tea-buy',
    objectBlock: 'お茶を',
    objectGoal: '차를 ',
    verbBlock: '買います。',
    verbGoal: '산다.',
    desireBlock: '買いたいです。',
    desireGoal: '사고 싶다.',
    distractorObjectBlock: '水を',
    distractorObjectAdvice: '여기서는 물보다 차가 맞습니다.',
    distractorVerbBlock: '飲みます。',
    distractorVerbAdvice: '여기서는 마시다가 아니라 사다입니다.'
  }
];

function isNaturalTravelCombination(time, place) {
  if (place.id === 'home') {
    return ['today', 'tomorrow', 'night'].includes(time.id);
  }

  return true;
}

function createTravelExercise(subject, time, place, order) {
  const stage2DistractorPlace = pickAlternativePlaceBlock(place.block, '店に');
  const stage3DistractorPlace = pickAlternativePlaceBlock(place.block, '駅に');

  return {
    id: `jlpt-n5-travel-${String(order).padStart(3, '0')}`,
    language: 'ja',
    level: 'jlpt_n5',
    title: `${place.goal.trim()} 이동 연습 ${String(order).padStart(3, '0')}`,
    description: '기본 이동문에서 시간과 희망 표현까지 단계적으로 조립합니다.',
    stages: [
      {
        id: `travel-${order}-stage-1`,
        title: '1단계',
        goal: `${subject.goal}간다.`,
        goalSegments: [subject.goal, '간다.'],
        focus: '주어 + 동사',
        selectionAdvice: '주어와 동사부터 고르세요.',
        completionAdvice: '기본 문장 완성. 다음은 장소입니다.',
        correctBlocks: [
          { id: `travel-${order}-s1-b1`, text: subject.block },
          { id: `travel-${order}-s1-b2`, text: '行きます。' }
        ],
        distractorBlocks: [
          {
            id: `travel-${order}-s1-d1`,
            text: place.block,
            advice: '장소는 아직 아닙니다.'
          },
          {
            id: `travel-${order}-s1-d2`,
            text: '来ます。',
            advice: '여기서는 오다가 아니라 가다입니다.'
          }
        ]
      },
      {
        id: `travel-${order}-stage-2`,
        title: '2단계',
        goal: `${subject.goal}${place.goal}간다.`,
        goalSegments: [subject.goal, place.goal, '간다.'],
        focus: '주어 + 장소 + 동사',
        selectionAdvice: '장소 블록을 붙이세요.',
        completionAdvice: '장소까지 완성. 다음은 시간입니다.',
        correctBlocks: [
          { id: `travel-${order}-s2-b1`, text: subject.block },
          { id: `travel-${order}-s2-b2`, text: place.block },
          { id: `travel-${order}-s2-b3`, text: '行きます。' }
        ],
        distractorBlocks: [
          {
            id: `travel-${order}-s2-d1`,
            text: stage2DistractorPlace,
            advice: '여기서는 다른 장소가 아니라 현재 장소가 맞습니다.'
          },
          {
            id: `travel-${order}-s2-d2`,
            text: '来ます。',
            advice: '여기서는 오다가 아니라 가다입니다.'
          }
        ]
      },
      {
        id: `travel-${order}-stage-3`,
        title: '3단계',
        goal: `${time.goal}${subject.goal}${place.goal}간다.`,
        goalSegments: [time.goal, subject.goal, place.goal, '간다.'],
        focus: '시간 + 주어 + 장소 + 동사',
        selectionAdvice: '문장 맨 앞에 시간 블록을 두세요.',
        completionAdvice: '시간까지 완성. 다음은 희망 표현입니다.',
        correctBlocks: [
          { id: `travel-${order}-s3-b1`, text: time.block },
          { id: `travel-${order}-s3-b2`, text: subject.block },
          { id: `travel-${order}-s3-b3`, text: place.block },
          { id: `travel-${order}-s3-b4`, text: '行きます。' }
        ],
        distractorBlocks: [
          {
            id: `travel-${order}-s3-d1`,
            text: '今は',
            advice: '여기서는 설정된 시간 표현이 먼저입니다.'
          },
          {
            id: `travel-${order}-s3-d2`,
            text: stage3DistractorPlace,
            advice: '여기서는 다른 장소가 아니라 현재 장소가 맞습니다.'
          }
        ]
      },
      {
        id: `travel-${order}-stage-4`,
        title: '4단계',
        goal: `${time.goal}${subject.goal}${place.goal}가고 싶다.`,
        goalSegments: [time.goal, subject.goal, place.goal, '가고 싶다.'],
        focus: '희망 표현',
        selectionAdvice: '마지막은 희망 표현을 고르세요.',
        completionAdvice: '희망 표현까지 완성했습니다.',
        correctBlocks: [
          { id: `travel-${order}-s4-b1`, text: time.block },
          { id: `travel-${order}-s4-b2`, text: subject.block },
          { id: `travel-${order}-s4-b3`, text: place.block },
          { id: `travel-${order}-s4-b4`, text: '行きたいです。' }
        ],
        distractorBlocks: [
          {
            id: `travel-${order}-s4-d1`,
            text: '行きます。',
            advice: '여기서는 기본 동작보다 희망 표현이 필요합니다.'
          },
          {
            id: `travel-${order}-s4-d2`,
            text: '来たいです。',
            advice: '여기서는 오다가 아니라 가고 싶다가 맞습니다.'
          }
        ]
      }
    ]
  };
}

function createObjectExercise(subject, time, pattern, order) {
  return {
    id: `jlpt-n5-object-${String(order).padStart(3, '0')}`,
    language: 'ja',
    level: 'jlpt_n5',
    title: `${pattern.objectGoal.trim()} 표현 연습 ${String(order).padStart(3, '0')}`,
    description: '대상과 동사를 이어 기본문부터 희망 표현까지 단계적으로 조립합니다.',
    stages: [
      {
        id: `object-${order}-stage-1`,
        title: '1단계',
        goal: `${subject.goal}${pattern.verbGoal}`,
        goalSegments: [subject.goal, pattern.verbGoal],
        focus: '주어 + 동사',
        selectionAdvice: '주어와 동사부터 고르세요.',
        completionAdvice: '기본 문장 완성. 다음은 대상입니다.',
        correctBlocks: [
          { id: `object-${order}-s1-b1`, text: subject.block },
          { id: `object-${order}-s1-b2`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          {
            id: `object-${order}-s1-d1`,
            text: pattern.objectBlock,
            advice: '대상은 아직 아닙니다.'
          },
          {
            id: `object-${order}-s1-d2`,
            text: pattern.desireBlock,
            advice: '희망 표현은 아직 아닙니다.'
          }
        ]
      },
      {
        id: `object-${order}-stage-2`,
        title: '2단계',
        goal: `${subject.goal}${pattern.objectGoal}${pattern.verbGoal}`,
        goalSegments: [subject.goal, pattern.objectGoal, pattern.verbGoal],
        focus: '주어 + 대상 + 동사',
        selectionAdvice: '대상 블록을 붙이세요.',
        completionAdvice: '대상까지 완성. 다음은 시간입니다.',
        correctBlocks: [
          { id: `object-${order}-s2-b1`, text: subject.block },
          { id: `object-${order}-s2-b2`, text: pattern.objectBlock },
          { id: `object-${order}-s2-b3`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          {
            id: `object-${order}-s2-d1`,
            text: pattern.distractorObjectBlock,
            advice: pattern.distractorObjectAdvice
          },
          {
            id: `object-${order}-s2-d2`,
            text: pattern.distractorVerbBlock,
            advice: pattern.distractorVerbAdvice
          }
        ]
      },
      {
        id: `object-${order}-stage-3`,
        title: '3단계',
        goal: `${time.goal}${subject.goal}${pattern.objectGoal}${pattern.verbGoal}`,
        goalSegments: [time.goal, subject.goal, pattern.objectGoal, pattern.verbGoal],
        focus: '시간 + 주어 + 대상 + 동사',
        selectionAdvice: '문장 맨 앞에 시간 블록을 두세요.',
        completionAdvice: '시간까지 완성. 다음은 희망 표현입니다.',
        correctBlocks: [
          { id: `object-${order}-s3-b1`, text: time.block },
          { id: `object-${order}-s3-b2`, text: subject.block },
          { id: `object-${order}-s3-b3`, text: pattern.objectBlock },
          { id: `object-${order}-s3-b4`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          {
            id: `object-${order}-s3-d1`,
            text: '今は',
            advice: '여기서는 설정된 시간 표현이 먼저입니다.'
          },
          {
            id: `object-${order}-s3-d2`,
            text: pattern.distractorObjectBlock,
            advice: pattern.distractorObjectAdvice
          }
        ]
      },
      {
        id: `object-${order}-stage-4`,
        title: '4단계',
        goal: `${time.goal}${subject.goal}${pattern.objectGoal}${pattern.desireGoal}`,
        goalSegments: [time.goal, subject.goal, pattern.objectGoal, pattern.desireGoal],
        focus: '희망 표현',
        selectionAdvice: '마지막은 희망 표현을 고르세요.',
        completionAdvice: '희망 표현까지 완성했습니다.',
        correctBlocks: [
          { id: `object-${order}-s4-b1`, text: time.block },
          { id: `object-${order}-s4-b2`, text: subject.block },
          { id: `object-${order}-s4-b3`, text: pattern.objectBlock },
          { id: `object-${order}-s4-b4`, text: pattern.desireBlock }
        ],
        distractorBlocks: [
          {
            id: `object-${order}-s4-d1`,
            text: pattern.verbBlock,
            advice: '여기서는 기본 동작보다 희망 표현이 필요합니다.'
          },
          {
            id: `object-${order}-s4-d2`,
            text: pattern.distractorObjectBlock,
            advice: pattern.distractorObjectAdvice
          }
        ]
      }
    ]
  };
}

async function main() {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const currentSeed = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  const baseExercise = currentSeed[0];
  const exercises = [baseExercise];

  let order = 1;

  for (const subject of subjects) {
    for (const time of times) {
      for (const place of places) {
        if (!isNaturalTravelCombination(time, place)) {
          continue;
        }

        exercises.push(createTravelExercise(subject, time, place, order));
        order += 1;
      }
    }
  }

  for (const subject of subjects) {
    for (const time of times) {
      for (const pattern of objectPatterns) {
        if (exercises.length >= 200) {
          break;
        }

        exercises.push(createObjectExercise(subject, time, pattern, order));
        order += 1;
      }
    }
  }

  const trimmedExercises = exercises.slice(0, 200);
  await fs.writeFile(outputPath, `${JSON.stringify(trimmedExercises, null, 2)}\n`);
  console.log(`Generated ${trimmedExercises.length} JLPT N5 sentence exercises.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
