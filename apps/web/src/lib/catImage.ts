const availableStatusImages: Record<string, string[]> = {
  kitten: [
    'base',
    'hungry',
    'smelly',
    'stressed',
    'sick',
    'critical',
    'dead',
    'action-feed',
    'action-play',
    'action-wash'
  ],
  junior: [
    'healthy',
    'hungry',
    'smelly',
    'stressed',
    'sick',
    'critical',
    'dead',
    'action-feed',
    'action-play',
    'action-wash'
  ],
  adult: [
    'healthy',
    'hungry',
    'smelly',
    'stressed',
    'sick',
    'critical',
    'dead',
    'action-feed',
    'action-play',
    'action-wash'
  ],
  'middle-age': [
    'healthy',
    'hungry',
    'smelly',
    'stressed',
    'sick',
    'critical',
    'dead',
    'action-feed',
    'action-play',
    'action-wash'
  ],
  senior: [
    'healthy',
    'hungry',
    'smelly',
    'stressed',
    'sick',
    'critical',
    'dead',
    'action-feed',
    'action-play',
    'action-wash'
  ],
  veteran: [
    'healthy',
    'hungry',
    'smelly',
    'stressed',
    'sick',
    'critical',
    'dead',
    'action-feed',
    'action-play',
    'action-wash'
  ],
  legacy: ['healthy']
};

const stageFallbackChain = [
  'legacy',
  'veteran',
  'senior',
  'middle-age',
  'adult',
  'junior',
  'kitten'
];

export function normalizeCatImageStage(stage: string): string {
  return stage === 'middleAge' ? 'middle-age' : stage;
}

export function normalizeCatImageStatus(stage: string, status: string): string {
  const normalizedStage = normalizeCatImageStage(stage);

  if (normalizedStage === 'kitten' && status === 'healthy') {
    return 'base';
  }

  return status;
}

export function getCatImagePath(stage: string, status: string): string {
  const normalizedStage = normalizeCatImageStage(stage);
  const normalizedStatus = normalizeCatImageStatus(stage, status);

  if (availableStatusImages[normalizedStage]?.includes(normalizedStatus)) {
    return `/images/cats/${normalizedStage}-${normalizedStatus}.png`;
  }

  const stageIndex = stageFallbackChain.indexOf(normalizedStage);
  if (stageIndex !== -1) {
    for (let i = stageIndex + 1; i < stageFallbackChain.length; i += 1) {
      const fallbackStage = stageFallbackChain[i];
      if (!fallbackStage) {
        continue;
      }
      if (availableStatusImages[fallbackStage]?.includes(normalizedStatus)) {
        return `/images/cats/${fallbackStage}-${normalizedStatus}.png`;
      }
    }
  }

  return '/images/cats/kitten-base.png';
}
