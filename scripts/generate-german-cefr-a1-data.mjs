import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const curriculumPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/de/cefr-a1.json'
);
const sentencePath = path.resolve(
  __dirname,
  '../packages/shared/src/data/de/cefr-a1-sentence-expansion.json'
);

const curriculum = [
  {
    id: 'de-cefr-a1-people',
    language: 'de',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 1,
    title: 'Grundlegende Personen',
    words: [
      word('ich', 'Ich', '나', 'Ich lerne Deutsch.', 'pronoun', ['Wir', 'Mein Freund', 'Der Lehrer']),
      word('wir', 'Wir', '우리', 'Wir gehen zur Schule.', 'pronoun', ['Ich', 'Der Student', 'Der Lehrer']),
      word('mein-freund', 'Mein Freund', '내 친구', 'Mein Freund trinkt Tee.', 'noun', ['Wir', 'Der Lehrer', 'Der Student']),
      word('der-lehrer', 'Der Lehrer', '선생님', 'Der Lehrer liest ein Buch.', 'noun', ['Mein Freund', 'Der Student', 'Wir']),
      word('der-student', 'Der Student', '학생', 'Der Student schreibt den Namen.', 'noun', ['Der Lehrer', 'Mein Freund', 'Ich'])
    ]
  },
  {
    id: 'de-cefr-a1-time',
    language: 'de',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 2,
    title: 'Grundlegende Zeitangaben',
    words: [
      word('heute', 'heute', '오늘', 'Heute gehe ich zur Schule.', 'adverb', ['morgen', 'jeden Tag', 'am Morgen']),
      word('morgen', 'morgen', '내일', 'Morgen kommt der Lehrer.', 'adverb', ['heute', 'am Abend', 'jeden Tag']),
      word('jeden-tag', 'jeden Tag', '매일', 'Wir lernen jeden Tag.', 'adverb', ['heute', 'morgen', 'am Abend']),
      word('am-morgen', 'am Morgen', '아침에', 'Am Morgen trinke ich Wasser.', 'adverb', ['am Abend', 'heute', 'morgen']),
      word('am-abend', 'am Abend', '밤에', 'Am Abend liest mein Freund.', 'adverb', ['am Morgen', 'heute', 'morgen'])
    ]
  },
  {
    id: 'de-cefr-a1-places',
    language: 'de',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 3,
    title: 'Grundlegende Orte',
    words: [
      word('zur-schule', 'zur Schule', '학교에', 'Ich gehe zur Schule.', 'phrase', ['zum Bahnhof', 'nach Hause', 'zum Laden']),
      word('zum-bahnhof', 'zum Bahnhof', '역에', 'Wir gehen zum Bahnhof.', 'phrase', ['zur Schule', 'nach Hause', 'zum Laden']),
      word('nach-hause', 'nach Hause', '집에', 'Mein Freund kommt nach Hause.', 'phrase', ['zur Schule', 'zum Bahnhof', 'zum Laden']),
      word('zum-laden', 'zum Laden', '가게에', 'Der Lehrer geht zum Laden.', 'phrase', ['zur Schule', 'zum Bahnhof', 'nach Hause'])
    ]
  },
  {
    id: 'de-cefr-a1-actions',
    language: 'de',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 4,
    title: 'Grundlegende Verben',
    words: [
      word('gehen', 'gehen', '가다', 'Wir gehen heute zur Schule.', 'verb', ['kommen', 'trinken', 'essen']),
      word('kommen', 'kommen', '오다', 'Der Student kommt morgen nach Hause.', 'verb', ['gehen', 'lesen', 'schreiben']),
      word('trinken', 'trinken', '마시다', 'Ich trinke Wasser.', 'verb', ['essen', 'lesen', 'schreiben']),
      word('essen', 'essen', '먹다', 'Mein Freund isst Brot.', 'verb', ['trinken', 'lesen', 'schreiben']),
      word('lesen', 'lesen', '읽다', 'Der Lehrer liest ein Buch.', 'verb', ['schreiben', 'essen', 'trinken']),
      word('schreiben', 'schreiben', '쓰다', 'Der Student schreibt den Namen.', 'verb', ['lesen', 'essen', 'trinken'])
    ]
  },
  {
    id: 'de-cefr-a1-objects',
    language: 'de',
    standardLevel: 'cefr_a1',
    level: 1,
    order: 5,
    title: 'Grundlegende Objekte',
    words: [
      word('wasser', 'Wasser', '물', 'Ich trinke Wasser.', 'noun', ['Tee', 'Brot', 'ein Buch']),
      word('tee', 'Tee', '차', 'Mein Freund trinkt Tee.', 'noun', ['Wasser', 'Brot', 'den Namen']),
      word('brot', 'Brot', '빵', 'Der Student isst Brot.', 'noun', ['Wasser', 'Tee', 'ein Buch']),
      word('ein-buch', 'ein Buch', '책', 'Der Lehrer liest ein Buch.', 'noun', ['Brot', 'Wasser', 'den Namen']),
      word('den-namen', 'den Namen', '이름', 'Ich schreibe den Namen.', 'noun', ['ein Buch', 'Tee', 'Wasser'])
    ]
  }
];

const subjects = [
  { id: 'ich', block: 'Ich', invertedBlock: 'ich', concept: 'i', agreement: 'base' },
  { id: 'wir', block: 'Wir', invertedBlock: 'wir', concept: 'we', agreement: 'plural' },
  { id: 'mein-freund', block: 'Mein Freund', invertedBlock: 'Mein Freund', concept: 'my_friend', agreement: 'third' },
  { id: 'der-lehrer', block: 'Der Lehrer', invertedBlock: 'Der Lehrer', concept: 'teacher', agreement: 'third' },
  { id: 'der-student', block: 'Der Student', invertedBlock: 'Der Student', concept: 'student', agreement: 'third' }
];

const times = [
  { id: 'heute', block: 'heute' },
  { id: 'morgen', block: 'morgen' },
  { id: 'jeden-tag', block: 'jeden Tag' },
  { id: 'am-morgen', block: 'am Morgen' },
  { id: 'am-abend', block: 'am Abend' }
];

const places = [
  { id: 'schule', block: 'zur Schule' },
  { id: 'bahnhof', block: 'zum Bahnhof' },
  { id: 'hause', block: 'nach Hause' },
  { id: 'laden', block: 'zum Laden' }
];

const objectPatterns = [
  {
    id: 'wasser-trinken',
    objectBlock: 'Wasser',
    title: 'Wasser trinken',
    predicateByAgreement: {
      base: 'trinke',
      plural: 'trinken',
      third: 'trinkt'
    },
    altObjectBlock: 'Tee',
    altObjectAdvice: 'Hier passt Wasser.',
    altPredicateByAgreement: {
      base: 'esse',
      plural: 'essen',
      third: 'isst'
    },
    altPredicateAdvice: 'Hier braucht man trinken, nicht essen.'
  },
  {
    id: 'tee-trinken',
    objectBlock: 'Tee',
    title: 'Tee trinken',
    predicateByAgreement: {
      base: 'trinke',
      plural: 'trinken',
      third: 'trinkt'
    },
    altObjectBlock: 'Wasser',
    altObjectAdvice: 'Hier passt Tee.',
    altPredicateByAgreement: {
      base: 'lese',
      plural: 'lesen',
      third: 'liest'
    },
    altPredicateAdvice: 'Hier braucht man trinken, nicht lesen.'
  },
  {
    id: 'brot-essen',
    objectBlock: 'Brot',
    title: 'Brot essen',
    predicateByAgreement: {
      base: 'esse',
      plural: 'essen',
      third: 'isst'
    },
    altObjectBlock: 'ein Buch',
    altObjectAdvice: 'Hier passt Brot.',
    altPredicateByAgreement: {
      base: 'trinke',
      plural: 'trinken',
      third: 'trinkt'
    },
    altPredicateAdvice: 'Hier braucht man essen, nicht trinken.'
  },
  {
    id: 'buch-lesen',
    objectBlock: 'ein Buch',
    title: 'ein Buch lesen',
    predicateByAgreement: {
      base: 'lese',
      plural: 'lesen',
      third: 'liest'
    },
    altObjectBlock: 'Brot',
    altObjectAdvice: 'Hier passt ein Buch.',
    altPredicateByAgreement: {
      base: 'schreibe',
      plural: 'schreiben',
      third: 'schreibt'
    },
    altPredicateAdvice: 'Hier braucht man lesen, nicht schreiben.'
  },
  {
    id: 'namen-schreiben',
    objectBlock: 'den Namen',
    title: 'den Namen schreiben',
    predicateByAgreement: {
      base: 'schreibe',
      plural: 'schreiben',
      third: 'schreibt'
    },
    altObjectBlock: 'ein Buch',
    altObjectAdvice: 'Hier passt "den Namen".',
    altPredicateByAgreement: {
      base: 'lese',
      plural: 'lesen',
      third: 'liest'
    },
    altPredicateAdvice: 'Hier braucht man schreiben, nicht lesen.'
  }
];

function word(id, term, meaning, example, partOfSpeech, distractors) {
  return {
    id,
    term,
    meaning,
    example,
    partOfSpeech,
    quiz: {
      distractors
    },
    writing: {
      prompt: buildWritingPrompt(meaning),
      answer: term,
      accepted: [term],
      script: 'mixed'
    }
  };
}

function buildWritingPrompt(meaning) {
  return `${meaning}${meaning.endsWith('에') ? '' : '에'} 맞는 독일어를 쓰세요.`;
}

function withPeriod(text) {
  return text.endsWith('.') ? text : `${text}.`;
}

function pickAlternativeTime(currentBlock, preferredBlock) {
  const preferred = times.find((time) => time.block === preferredBlock);

  if (preferred && preferred.block !== currentBlock) {
    return preferred;
  }

  return times.find((time) => time.block !== currentBlock) ?? times[0];
}

function pickAdditionalTimes(currentBlock) {
  return times.filter((time) => time.block !== currentBlock).slice(0, 4);
}

function pickAlternativePlace(currentBlock, preferredBlock) {
  const preferred = places.find((place) => place.block === preferredBlock);

  if (preferred && preferred.block !== currentBlock) {
    return preferred.block;
  }

  return places.find((place) => place.block !== currentBlock)?.block ?? 'zum Bahnhof';
}

function createTravelExercise(subject, time, place, order) {
  const baseVerb = subject.agreement === 'third' ? 'geht' : subject.agreement === 'plural' ? 'gehen' : 'gehe';
  const invertedSubject = subject.invertedBlock;
  const alternateTimes = pickAdditionalTimes(time.block);
  const [altOne, altTwo, altThree, altFour] = [
    alternateTimes[0] ?? pickAlternativeTime(time.block, 'morgen'),
    alternateTimes[1] ?? pickAlternativeTime(time.block, 'jeden Tag'),
    alternateTimes[2] ?? pickAlternativeTime(time.block, 'am Morgen'),
    alternateTimes[3] ?? pickAlternativeTime(time.block, 'am Abend')
  ];
  const altPlace = pickAlternativePlace(place.block, 'zum Laden');

  return {
    id: `de-cefr-a1-travel-${String(order).padStart(3, '0')}`,
    language: 'de',
    level: 'cefr_a1',
    title: `${place.block} ${String(order).padStart(3, '0')}`,
    description: 'Baue einen einfachen deutschen Satz Schritt fuer Schritt auf.',
    stages: [
      {
        id: `de-travel-${order}-stage-1`,
        title: 'Schritt 1',
        goal: `${subject.block} ${baseVerb}.`,
        goalSegments: [`${subject.block} `, `${baseVerb}.`],
        focus: 'Subjekt + Verb',
        selectionAdvice: 'Waehle zuerst Subjekt und Verb.',
        completionAdvice: 'Der Basissatz steht. Danach kommt der Ort.',
        correctBlocks: [
          { id: `de-travel-${order}-s1-b1`, text: subject.block },
          { id: `de-travel-${order}-s1-b2`, text: `${baseVerb}.` }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s1-d1`, text: withPeriod(place.block), advice: 'Der Ort kommt spaeter.' },
          { id: `de-travel-${order}-s1-d2`, text: 'kommt.', advice: 'Hier brauchst du gehen, nicht kommen.' }
        ]
      },
      {
        id: `de-travel-${order}-stage-2`,
        title: 'Schritt 2',
        goal: `${subject.block} ${baseVerb} ${place.block}.`,
        goalSegments: [`${subject.block} `, `${baseVerb} `, `${place.block}.`],
        focus: 'Subjekt + Verb + Ort',
        selectionAdvice: 'Setze den Ort hinter das Verb.',
        completionAdvice: 'Ort fertig. Jetzt kommt die Zeit dazu.',
        correctBlocks: [
          { id: `de-travel-${order}-s2-b1`, text: subject.block },
          { id: `de-travel-${order}-s2-b2`, text: baseVerb },
          { id: `de-travel-${order}-s2-b3`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s2-d1`, text: withPeriod(altPlace), advice: 'Hier passt der Zielort aus dem Satz.' },
          { id: `de-travel-${order}-s2-d2`, text: 'kommt', advice: 'Hier brauchst du gehen, nicht kommen.' }
        ]
      },
      {
        id: `de-travel-${order}-stage-3`,
        title: 'Schritt 3',
        goal: `${time.block} ${baseVerb} ${invertedSubject} ${place.block}.`,
        goalSegments: [`${time.block} `, `${baseVerb} `, `${invertedSubject} `, `${place.block}.`],
        focus: 'Zeit + Verb + Subjekt + Ort',
        selectionAdvice: 'Mit Zeit am Satzanfang steht das Verb an Position zwei.',
        completionAdvice: 'Die erste Zeitstellung ist geschafft.',
        correctBlocks: [
          { id: `de-travel-${order}-s3-b1`, text: time.block },
          { id: `de-travel-${order}-s3-b2`, text: baseVerb },
          { id: `de-travel-${order}-s3-b3`, text: invertedSubject },
          { id: `de-travel-${order}-s3-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s3-d1`, text: altOne.block, advice: 'Hier passt die vorgegebene Zeit.' },
          { id: `de-travel-${order}-s3-d2`, text: 'kommt', advice: 'Das Verb bleibt gehen.' }
        ]
      },
      {
        id: `de-travel-${order}-stage-4`,
        title: 'Schritt 4',
        goal: `${altOne.block} ${baseVerb} ${invertedSubject} ${place.block}.`,
        goalSegments: [`${altOne.block} `, `${baseVerb} `, `${invertedSubject} `, `${place.block}.`],
        focus: 'Neue Zeit + Verbzweitsatz',
        selectionAdvice: 'Tausche nur die Zeitangabe aus.',
        completionAdvice: 'Noch eine Zeitform ist fertig.',
        correctBlocks: [
          { id: `de-travel-${order}-s4-b1`, text: altOne.block },
          { id: `de-travel-${order}-s4-b2`, text: baseVerb },
          { id: `de-travel-${order}-s4-b3`, text: invertedSubject },
          { id: `de-travel-${order}-s4-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s4-d1`, text: time.block, advice: 'Jetzt brauchst du die neue Zeitangabe.' },
          { id: `de-travel-${order}-s4-d2`, text: 'kommt', advice: 'Das Verb bleibt gehen.' }
        ]
      },
      {
        id: `de-travel-${order}-stage-5`,
        title: 'Schritt 5',
        goal: `${altTwo.block} ${baseVerb} ${invertedSubject} ${place.block}.`,
        goalSegments: [`${altTwo.block} `, `${baseVerb} `, `${invertedSubject} `, `${place.block}.`],
        focus: 'Zeitvariation',
        selectionAdvice: 'Baue den Satz mit einer weiteren Zeitangabe.',
        completionAdvice: 'Die Satzstruktur bleibt gleich.',
        correctBlocks: [
          { id: `de-travel-${order}-s5-b1`, text: altTwo.block },
          { id: `de-travel-${order}-s5-b2`, text: baseVerb },
          { id: `de-travel-${order}-s5-b3`, text: invertedSubject },
          { id: `de-travel-${order}-s5-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s5-d1`, text: altOne.block, advice: 'Hier passt die neue Zeitangabe aus diesem Schritt.' },
          { id: `de-travel-${order}-s5-d2`, text: 'kommt', advice: 'Das Verb bleibt gehen.' }
        ]
      },
      {
        id: `de-travel-${order}-stage-6`,
        title: 'Schritt 6',
        goal: `${altThree.block} ${baseVerb} ${invertedSubject} ${place.block}.`,
        goalSegments: [`${altThree.block} `, `${baseVerb} `, `${invertedSubject} `, `${place.block}.`],
        focus: 'Zeit am Satzanfang festigen',
        selectionAdvice: 'Achte weiter auf die Verbposition.',
        completionAdvice: 'Fast fertig. Noch eine letzte Zeitangabe.',
        correctBlocks: [
          { id: `de-travel-${order}-s6-b1`, text: altThree.block },
          { id: `de-travel-${order}-s6-b2`, text: baseVerb },
          { id: `de-travel-${order}-s6-b3`, text: invertedSubject },
          { id: `de-travel-${order}-s6-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s6-d1`, text: altTwo.block, advice: 'Nimm die Zeitangabe aus diesem Schritt.' },
          { id: `de-travel-${order}-s6-d2`, text: 'kommt', advice: 'Das Verb bleibt gehen.' }
        ]
      },
      {
        id: `de-travel-${order}-stage-7`,
        title: 'Schritt 7',
        goal: `${altFour.block} ${baseVerb} ${invertedSubject} ${place.block}.`,
        goalSegments: [`${altFour.block} `, `${baseVerb} `, `${invertedSubject} `, `${place.block}.`],
        focus: 'Satzmuster abschliessen',
        selectionAdvice: 'Wende das gleiche Muster noch einmal sicher an.',
        completionAdvice: 'Du hast die ganze Satzreihe abgeschlossen.',
        correctBlocks: [
          { id: `de-travel-${order}-s7-b1`, text: altFour.block },
          { id: `de-travel-${order}-s7-b2`, text: baseVerb },
          { id: `de-travel-${order}-s7-b3`, text: invertedSubject },
          { id: `de-travel-${order}-s7-b4`, text: withPeriod(place.block) }
        ],
        distractorBlocks: [
          { id: `de-travel-${order}-s7-d1`, text: altThree.block, advice: 'Nutze die letzte neue Zeitangabe.' },
          { id: `de-travel-${order}-s7-d2`, text: 'kommt', advice: 'Das Verb bleibt gehen.' }
        ]
      }
    ]
  };
}

function createObjectExercise(subject, time, pattern, order) {
  const baseVerb = pattern.predicateByAgreement[subject.agreement];
  const altVerb = pattern.altPredicateByAgreement[subject.agreement];
  const invertedSubject = subject.invertedBlock;
  const alternateTimes = pickAdditionalTimes(time.block);
  const [altOne, altTwo, altThree, altFour] = [
    alternateTimes[0] ?? pickAlternativeTime(time.block, 'morgen'),
    alternateTimes[1] ?? pickAlternativeTime(time.block, 'jeden Tag'),
    alternateTimes[2] ?? pickAlternativeTime(time.block, 'am Morgen'),
    alternateTimes[3] ?? pickAlternativeTime(time.block, 'am Abend')
  ];

  return {
    id: `de-cefr-a1-object-${String(order).padStart(3, '0')}`,
    language: 'de',
    level: 'cefr_a1',
    title: `${pattern.title} ${String(order).padStart(3, '0')}`,
    description: 'Baue einen einfachen deutschen Objektsatz Schritt fuer Schritt auf.',
    stages: [
      {
        id: `de-object-${order}-stage-1`,
        title: 'Schritt 1',
        goal: `${subject.block} ${baseVerb}.`,
        goalSegments: [`${subject.block} `, `${baseVerb}.`],
        focus: 'Subjekt + Verb',
        selectionAdvice: 'Starte mit Subjekt und Verb.',
        completionAdvice: 'Danach kommt das Objekt.',
        correctBlocks: [
          { id: `de-object-${order}-s1-b1`, text: subject.block },
          { id: `de-object-${order}-s1-b2`, text: `${baseVerb}.` }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s1-d1`, text: withPeriod(pattern.objectBlock), advice: 'Das Objekt kommt erst im naechsten Schritt.' },
          { id: `de-object-${order}-s1-d2`, text: `${altVerb}.`, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `de-object-${order}-stage-2`,
        title: 'Schritt 2',
        goal: `${subject.block} ${baseVerb} ${pattern.objectBlock}.`,
        goalSegments: [`${subject.block} `, `${baseVerb} `, `${pattern.objectBlock}.`],
        focus: 'Subjekt + Verb + Objekt',
        selectionAdvice: 'Setze das Objekt hinter das Verb.',
        completionAdvice: 'Objekt fertig. Jetzt kommt die Zeit.',
        correctBlocks: [
          { id: `de-object-${order}-s2-b1`, text: subject.block },
          { id: `de-object-${order}-s2-b2`, text: baseVerb },
          { id: `de-object-${order}-s2-b3`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s2-d1`, text: withPeriod(pattern.altObjectBlock), advice: pattern.altObjectAdvice },
          { id: `de-object-${order}-s2-d2`, text: altVerb, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `de-object-${order}-stage-3`,
        title: 'Schritt 3',
        goal: `${time.block} ${baseVerb} ${invertedSubject} ${pattern.objectBlock}.`,
        goalSegments: [`${time.block} `, `${baseVerb} `, `${invertedSubject} `, `${pattern.objectBlock}.`],
        focus: 'Zeit + Verb + Subjekt + Objekt',
        selectionAdvice: 'Mit Zeit am Anfang steht das Verb auf Position zwei.',
        completionAdvice: 'Die erste Zeitform ist geschafft.',
        correctBlocks: [
          { id: `de-object-${order}-s3-b1`, text: time.block },
          { id: `de-object-${order}-s3-b2`, text: baseVerb },
          { id: `de-object-${order}-s3-b3`, text: invertedSubject },
          { id: `de-object-${order}-s3-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s3-d1`, text: altOne.block, advice: 'Hier passt die gegebene Zeitangabe.' },
          { id: `de-object-${order}-s3-d2`, text: altVerb, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `de-object-${order}-stage-4`,
        title: 'Schritt 4',
        goal: `${altOne.block} ${baseVerb} ${invertedSubject} ${pattern.objectBlock}.`,
        goalSegments: [`${altOne.block} `, `${baseVerb} `, `${invertedSubject} `, `${pattern.objectBlock}.`],
        focus: 'Neue Zeit + gleiches Satzmuster',
        selectionAdvice: 'Wechsle nur die Zeitangabe.',
        completionAdvice: 'Das Satzmuster bleibt stabil.',
        correctBlocks: [
          { id: `de-object-${order}-s4-b1`, text: altOne.block },
          { id: `de-object-${order}-s4-b2`, text: baseVerb },
          { id: `de-object-${order}-s4-b3`, text: invertedSubject },
          { id: `de-object-${order}-s4-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s4-d1`, text: time.block, advice: 'Jetzt brauchst du die neue Zeitangabe.' },
          { id: `de-object-${order}-s4-d2`, text: altVerb, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `de-object-${order}-stage-5`,
        title: 'Schritt 5',
        goal: `${altTwo.block} ${baseVerb} ${invertedSubject} ${pattern.objectBlock}.`,
        goalSegments: [`${altTwo.block} `, `${baseVerb} `, `${invertedSubject} `, `${pattern.objectBlock}.`],
        focus: 'Zeitvariation',
        selectionAdvice: 'Nimm noch eine andere Zeitangabe.',
        completionAdvice: 'Noch eine korrekte Verbzweitsatz-Struktur.',
        correctBlocks: [
          { id: `de-object-${order}-s5-b1`, text: altTwo.block },
          { id: `de-object-${order}-s5-b2`, text: baseVerb },
          { id: `de-object-${order}-s5-b3`, text: invertedSubject },
          { id: `de-object-${order}-s5-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s5-d1`, text: altOne.block, advice: 'Hier passt die Zeit aus diesem Schritt.' },
          { id: `de-object-${order}-s5-d2`, text: altVerb, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `de-object-${order}-stage-6`,
        title: 'Schritt 6',
        goal: `${altThree.block} ${baseVerb} ${invertedSubject} ${pattern.objectBlock}.`,
        goalSegments: [`${altThree.block} `, `${baseVerb} `, `${invertedSubject} `, `${pattern.objectBlock}.`],
        focus: 'Zeit am Satzanfang wiederholen',
        selectionAdvice: 'Achte weiter auf das Verb an Position zwei.',
        completionAdvice: 'Fast geschafft.',
        correctBlocks: [
          { id: `de-object-${order}-s6-b1`, text: altThree.block },
          { id: `de-object-${order}-s6-b2`, text: baseVerb },
          { id: `de-object-${order}-s6-b3`, text: invertedSubject },
          { id: `de-object-${order}-s6-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s6-d1`, text: altTwo.block, advice: 'Nutze die Zeitangabe aus diesem Schritt.' },
          { id: `de-object-${order}-s6-d2`, text: altVerb, advice: pattern.altPredicateAdvice }
        ]
      },
      {
        id: `de-object-${order}-stage-7`,
        title: 'Schritt 7',
        goal: `${altFour.block} ${baseVerb} ${invertedSubject} ${pattern.objectBlock}.`,
        goalSegments: [`${altFour.block} `, `${baseVerb} `, `${invertedSubject} `, `${pattern.objectBlock}.`],
        focus: 'Satzreihe abschliessen',
        selectionAdvice: 'Wende das gleiche Muster noch einmal sicher an.',
        completionAdvice: 'Du hast die ganze Satzreihe abgeschlossen.',
        correctBlocks: [
          { id: `de-object-${order}-s7-b1`, text: altFour.block },
          { id: `de-object-${order}-s7-b2`, text: baseVerb },
          { id: `de-object-${order}-s7-b3`, text: invertedSubject },
          { id: `de-object-${order}-s7-b4`, text: withPeriod(pattern.objectBlock) }
        ],
        distractorBlocks: [
          { id: `de-object-${order}-s7-d1`, text: altThree.block, advice: 'Hier passt die letzte neue Zeitangabe.' },
          { id: `de-object-${order}-s7-d2`, text: altVerb, advice: pattern.altPredicateAdvice }
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
  for (const time of [
    { id: 'heute', block: 'heute' },
    { id: 'morgen', block: 'morgen' },
    { id: 'jeden-tag', block: 'jeden Tag' },
    { id: 'am-morgen', block: 'am Morgen' }
  ]) {
    for (const pattern of objectPatterns) {
      exercises.push(createObjectExercise(subject, time, pattern, exercises.length + 1));
    }
  }
}

if (exercises.length !== 200) {
  throw new Error(`Expected 200 German CEFR A1 sentence exercises, got ${exercises.length}`);
}

await fs.writeFile(curriculumPath, `${JSON.stringify(curriculum, null, 2)}\n`);
await fs.writeFile(sentencePath, `${JSON.stringify(exercises, null, 2)}\n`);
console.log(`Generated German CEFR A1 curriculum (${curriculum.length} units) and ${exercises.length} sentence exercises.`);
