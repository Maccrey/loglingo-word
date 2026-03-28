import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/en/cefr-a1-sentence-expansion.json'
);

const subjects = [
  { id: 'i', block: 'I', goal: 'I ' },
  { id: 'you', block: 'You', goal: 'You ' },
  { id: 'we', block: 'We', goal: 'We ' },
  { id: 'my-friend', block: 'My friend', goal: 'My friend ' }
];

const times = [
  { id: 'today', block: 'today', goal: 'today ' },
  { id: 'tomorrow', block: 'tomorrow', goal: 'tomorrow ' },
  { id: 'every-day', block: 'every day', goal: 'every day ' },
  { id: 'in-the-morning', block: 'in the morning', goal: 'in the morning ' },
  { id: 'at-night', block: 'at night', goal: 'at night ' }
];

const places = [
  { id: 'school', block: 'to school', goal: 'to school ' },
  { id: 'station', block: 'to the station', goal: 'to the station ' },
  { id: 'home', block: 'home', goal: 'home ' },
  { id: 'store', block: 'to the store', goal: 'to the store ' }
];

const objectPatterns = [
  {
    id: 'water-drink',
    objectBlock: 'water',
    objectGoal: 'water.',
    actionBlock: 'drink',
    verbBlock: 'drink.',
    verbGoal: 'drink.',
    desireBlock: 'want to drink',
    desireGoal: 'want to drink water.',
    distractorObjectBlock: 'tea',
    distractorObjectAdvice: 'Use the target drink for this sentence.',
    distractorVerbBlock: 'eat',
    distractorVerbAdvice: 'This sentence needs drink, not eat.'
  },
  {
    id: 'tea-drink',
    objectBlock: 'tea',
    objectGoal: 'tea.',
    actionBlock: 'drink',
    verbBlock: 'drink.',
    verbGoal: 'drink.',
    desireBlock: 'want to drink',
    desireGoal: 'want to drink tea.',
    distractorObjectBlock: 'water',
    distractorObjectAdvice: 'Use the target drink for this sentence.',
    distractorVerbBlock: 'eat',
    distractorVerbAdvice: 'This sentence needs drink, not eat.'
  },
  {
    id: 'bread-eat',
    objectBlock: 'bread',
    objectGoal: 'bread.',
    actionBlock: 'eat',
    verbBlock: 'eat.',
    verbGoal: 'eat.',
    desireBlock: 'want to eat',
    desireGoal: 'want to eat bread.',
    distractorObjectBlock: 'book',
    distractorObjectAdvice: 'Use the target food for this sentence.',
    distractorVerbBlock: 'read',
    distractorVerbAdvice: 'This sentence needs eat, not read.'
  },
  {
    id: 'book-read',
    objectBlock: 'a book',
    objectGoal: 'a book.',
    actionBlock: 'read',
    verbBlock: 'read.',
    verbGoal: 'read.',
    desireBlock: 'want to read',
    desireGoal: 'want to read a book.',
    distractorObjectBlock: 'bread',
    distractorObjectAdvice: 'Use the target object for this sentence.',
    distractorVerbBlock: 'eat',
    distractorVerbAdvice: 'This sentence needs read, not eat.'
  },
  {
    id: 'name-write',
    objectBlock: 'my name',
    objectGoal: 'my name.',
    actionBlock: 'write',
    verbBlock: 'write.',
    verbGoal: 'write.',
    desireBlock: 'want to write',
    desireGoal: 'want to write my name.',
    distractorObjectBlock: 'a book',
    distractorObjectAdvice: 'Use the target object for this sentence.',
    distractorVerbBlock: 'read',
    distractorVerbAdvice: 'This sentence needs write, not read.'
  },
  {
    id: 'bread-buy',
    objectBlock: 'bread',
    objectGoal: 'bread.',
    actionBlock: 'buy',
    verbBlock: 'buy.',
    verbGoal: 'buy.',
    desireBlock: 'want to buy',
    desireGoal: 'want to buy bread.',
    distractorObjectBlock: 'water',
    distractorObjectAdvice: 'Use the target item for this sentence.',
    distractorVerbBlock: 'drink',
    distractorVerbAdvice: 'This sentence needs buy, not drink.'
  }
];

function punctuate(input) {
  return input.endsWith('.') ? input : `${input}.`;
}

function trimPeriod(input) {
  return input.endsWith('.') ? input.slice(0, -1) : input;
}

function pickAlternativePlace(currentBlock, preferredBlock) {
  const preferred = places.find((item) => item.block === preferredBlock);

  if (preferred && preferred.block !== currentBlock) {
    return preferred.block;
  }

  return places.find((item) => item.block !== currentBlock)?.block ?? 'to school';
}

function createTravelExercise(subject, time, place, order) {
  const altStage2Place = pickAlternativePlace(place.block, 'to the store');
  const altStage3Place = pickAlternativePlace(place.block, 'to the station');

  return {
    id: `cefr-a1-travel-${String(order).padStart(3, '0')}`,
    language: 'en',
    level: 'cefr_a1',
    title: `Go Practice ${String(order).padStart(3, '0')}`,
    description: 'Build a simple English sentence step by step with time, place, and want to.',
    stages: [
      {
        id: `cefr-travel-${order}-stage-1`,
        title: 'Step 1',
        goal: `${subject.goal}go.`,
        goalSegments: [subject.goal, 'go.'],
        focus: 'subject + verb',
        selectionAdvice: 'Start with the subject and verb.',
        completionAdvice: 'Basic sentence done. Add the place next.',
        correctBlocks: [
          { id: `cefr-travel-${order}-s1-b1`, text: subject.block },
          { id: `cefr-travel-${order}-s1-b2`, text: 'go.' }
        ],
        distractorBlocks: [
          { id: `cefr-travel-${order}-s1-d1`, text: place.block, advice: 'The place comes later.' },
          { id: `cefr-travel-${order}-s1-d2`, text: 'come.', advice: 'Use go, not come.' }
        ]
      },
      {
        id: `cefr-travel-${order}-stage-2`,
        title: 'Step 2',
        goal: `${subject.goal}go ${place.goal.trim()}.`,
        goalSegments: [subject.goal, 'go ', punctuate(place.block)],
        focus: 'subject + verb + place',
        selectionAdvice: 'Add the verb, then the place.',
        completionAdvice: 'Place done. Add time next.',
        correctBlocks: [
          { id: `cefr-travel-${order}-s2-b1`, text: subject.block },
          { id: `cefr-travel-${order}-s2-b2`, text: 'go' },
          { id: `cefr-travel-${order}-s2-b3`, text: punctuate(place.block) }
        ],
        distractorBlocks: [
          { id: `cefr-travel-${order}-s2-d1`, text: punctuate(altStage2Place), advice: 'Use the target place for this sentence.' },
          { id: `cefr-travel-${order}-s2-d2`, text: 'come', advice: 'Use go, not come.' }
        ]
      },
      {
        id: `cefr-travel-${order}-stage-3`,
        title: 'Step 3',
        goal: `${subject.goal}go ${place.goal.trim()} ${time.goal.trim()}.`,
        goalSegments: [subject.goal, 'go ', `${place.goal}${time.goal.trim()}.`],
        focus: 'subject + verb + place + time',
        selectionAdvice: 'Add the time expression last.',
        completionAdvice: 'Time done. Add want to next.',
        correctBlocks: [
          { id: `cefr-travel-${order}-s3-b1`, text: subject.block },
          { id: `cefr-travel-${order}-s3-b2`, text: 'go' },
          { id: `cefr-travel-${order}-s3-b3`, text: punctuate(place.block) },
          { id: `cefr-travel-${order}-s3-b4`, text: time.block }
        ],
        distractorBlocks: [
          { id: `cefr-travel-${order}-s3-d1`, text: 'now', advice: 'Use the target time expression here.' },
          { id: `cefr-travel-${order}-s3-d2`, text: punctuate(altStage3Place), advice: 'Use the target place for this sentence.' }
        ]
      },
      {
        id: `cefr-travel-${order}-stage-4`,
        title: 'Step 4',
        goal: `${subject.goal}want to go ${place.goal.trim()} ${time.goal.trim()}.`,
        goalSegments: [subject.goal, 'want to go ', `${place.goal}${time.goal.trim()}.`],
        focus: 'want to',
        selectionAdvice: 'Finish with want to go.',
        completionAdvice: 'This sentence is complete.',
        correctBlocks: [
          { id: `cefr-travel-${order}-s4-b1`, text: subject.block },
          { id: `cefr-travel-${order}-s4-b2`, text: 'want to go' },
          { id: `cefr-travel-${order}-s4-b3`, text: punctuate(place.block) },
          { id: `cefr-travel-${order}-s4-b4`, text: time.block }
        ],
        distractorBlocks: [
          { id: `cefr-travel-${order}-s4-d1`, text: 'go', advice: 'Use want to go for this step.' },
          { id: `cefr-travel-${order}-s4-d2`, text: 'want to come', advice: 'Use go, not come.' }
        ]
      }
    ]
  };
}

function createObjectExercise(subject, time, pattern, order) {
  return {
    id: `cefr-a1-object-${String(order).padStart(3, '0')}`,
    language: 'en',
    level: 'cefr_a1',
    title: `Object Practice ${String(order).padStart(3, '0')}`,
    description: 'Build a simple English sentence with an object and a basic action.',
    stages: [
      {
        id: `cefr-object-${order}-stage-1`,
        title: 'Step 1',
        goal: `${subject.goal}${pattern.verbGoal}`,
        goalSegments: [subject.goal, pattern.verbGoal],
        focus: 'subject + verb',
        selectionAdvice: 'Start with the subject and verb.',
        completionAdvice: 'Basic sentence done. Add the object next.',
        correctBlocks: [
          { id: `cefr-object-${order}-s1-b1`, text: subject.block },
          { id: `cefr-object-${order}-s1-b2`, text: pattern.verbBlock }
        ],
        distractorBlocks: [
          { id: `cefr-object-${order}-s1-d1`, text: pattern.objectBlock, advice: 'The object comes later.' },
          { id: `cefr-object-${order}-s1-d2`, text: pattern.desireBlock, advice: 'Want to comes later.' }
        ]
      },
      {
        id: `cefr-object-${order}-stage-2`,
        title: 'Step 2',
        goal: `${subject.goal}${pattern.actionBlock} ${pattern.objectGoal}`,
        goalSegments: [subject.goal, `${pattern.actionBlock} `, pattern.objectGoal],
        focus: 'subject + verb + object',
        selectionAdvice: 'Add the verb, then the object.',
        completionAdvice: 'Object done. Add time next.',
        correctBlocks: [
          { id: `cefr-object-${order}-s2-b1`, text: subject.block },
          { id: `cefr-object-${order}-s2-b2`, text: pattern.actionBlock },
          { id: `cefr-object-${order}-s2-b3`, text: pattern.objectGoal }
        ],
        distractorBlocks: [
          { id: `cefr-object-${order}-s2-d1`, text: punctuate(pattern.distractorObjectBlock), advice: pattern.distractorObjectAdvice },
          { id: `cefr-object-${order}-s2-d2`, text: pattern.distractorVerbBlock, advice: pattern.distractorVerbAdvice }
        ]
      },
      {
        id: `cefr-object-${order}-stage-3`,
        title: 'Step 3',
        goal: `${subject.goal}${pattern.actionBlock} ${pattern.objectGoal.slice(0, -1)} ${time.goal.trim()}.`,
        goalSegments: [
          subject.goal,
          `${pattern.actionBlock} `,
          `${pattern.objectGoal.slice(0, -1)} `,
          `${time.goal.trim()}.`
        ],
        focus: 'subject + verb + object + time',
        selectionAdvice: 'Add the time expression last.',
        completionAdvice: 'Time done. Add want to next.',
        correctBlocks: [
          { id: `cefr-object-${order}-s3-b1`, text: subject.block },
          { id: `cefr-object-${order}-s3-b2`, text: pattern.actionBlock },
          { id: `cefr-object-${order}-s3-b3`, text: pattern.objectGoal },
          { id: `cefr-object-${order}-s3-b4`, text: time.block }
        ],
        distractorBlocks: [
          { id: `cefr-object-${order}-s3-d1`, text: 'now', advice: 'Use the target time expression here.' },
          { id: `cefr-object-${order}-s3-d2`, text: punctuate(pattern.distractorObjectBlock), advice: pattern.distractorObjectAdvice }
        ]
      },
      {
        id: `cefr-object-${order}-stage-4`,
        title: 'Step 4',
        goal: `${subject.goal}${pattern.desireBlock} ${pattern.objectGoal.slice(0, -1)} ${time.goal.trim()}.`,
        goalSegments: [
          subject.goal,
          `${pattern.desireBlock} `,
          `${pattern.objectGoal.slice(0, -1)} `,
          `${time.goal.trim()}.`
        ],
        focus: 'want to',
        selectionAdvice: 'Finish with want to.',
        completionAdvice: 'This sentence is complete.',
        correctBlocks: [
          { id: `cefr-object-${order}-s4-b1`, text: subject.block },
          { id: `cefr-object-${order}-s4-b2`, text: pattern.desireBlock },
          { id: `cefr-object-${order}-s4-b3`, text: pattern.objectGoal },
          { id: `cefr-object-${order}-s4-b4`, text: time.block }
        ],
        distractorBlocks: [
          { id: `cefr-object-${order}-s4-d1`, text: pattern.actionBlock, advice: 'Use want to for this step.' },
          { id: `cefr-object-${order}-s4-d2`, text: punctuate(pattern.distractorObjectBlock), advice: pattern.distractorObjectAdvice }
        ]
      }
    ]
  };
}

const timeBlockSet = new Set(times.map((item) => item.block));
const placeBlockSet = new Set(places.map((item) => item.block));

function normalizeEnglishFourBlockStage(stage) {
  if (stage.correctBlocks.length !== 4) {
    return stage;
  }

  const texts = stage.correctBlocks.map((block) => block.text);

  if (!timeBlockSet.has(texts[0])) {
    return stage;
  }

  const reorderedTexts = [texts[1], texts[2], texts[3], texts[0]];
  const normalizedGoal = `${trimPeriod(reorderedTexts[0])} ${trimPeriod(
    reorderedTexts[1]
  )} ${trimPeriod(reorderedTexts[2])} ${trimPeriod(reorderedTexts[3])}.`;
  const normalizedSegments = [
    `${trimPeriod(reorderedTexts[0])} `,
    `${trimPeriod(reorderedTexts[1])} `,
    `${trimPeriod(reorderedTexts[2])} `,
    `${trimPeriod(reorderedTexts[3])}.`
  ];
  const reorderedBlocks = [
    stage.correctBlocks[1],
    stage.correctBlocks[2],
    stage.correctBlocks[3],
    stage.correctBlocks[0]
  ];
  const focusTail = placeBlockSet.has(trimPeriod(reorderedTexts[2]))
    ? 'place'
    : 'object';

  return {
    ...stage,
    goal: normalizedGoal,
    goalSegments: normalizedSegments,
    focus: `subject + verb + ${focusTail} + time`,
    selectionAdvice: 'Add the time expression last.',
    correctBlocks: reorderedBlocks
  };
}

function normalizeEnglishExercises(exercises) {
  return exercises.map((exercise) => ({
    ...exercise,
    stages: exercise.stages.map((stage) => normalizeEnglishFourBlockStage(stage))
  }));
}

async function main() {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const exercises = [];
  let order = 1;

  for (const subject of subjects) {
    for (const time of times) {
      for (const place of places) {
        exercises.push(createTravelExercise(subject, time, place, order));
        order += 1;
      }
    }
  }

  for (const subject of subjects) {
    for (const time of times) {
      for (const pattern of objectPatterns) {
        exercises.push(createObjectExercise(subject, time, pattern, order));
        order += 1;
      }
    }
  }

  const normalizedExercises = normalizeEnglishExercises(exercises);

  await fs.writeFile(
    outputPath,
    `${JSON.stringify(normalizedExercises, null, 2)}\n`
  );
  console.log(
    `Generated ${normalizedExercises.length} CEFR A1 sentence exercises.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
