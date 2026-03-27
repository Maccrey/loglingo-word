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
    'action-wash',
    'action-medicine'
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
    'action-wash',
    'action-medicine'
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
    'action-wash',
    'action-medicine'
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
    'action-wash',
    'action-medicine'
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
    'action-wash',
    'action-medicine'
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
    'action-wash',
    'action-medicine'
  ],
  legacy: ['healthy', 'action-medicine']
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

const medicineImagePathByStage: Record<string, string> = {
  kitten: '/images/cats/kitten_action_medicine.png',
  junior: '/images/cats/junior_action_medicine.png',
  adult: '/images/cats/adult_action_medicine.png',
  'middle-age': '/images/cats/middle_age_medicine.png',
  senior: '/images/cats/senior_action_medicine.png',
  veteran: '/images/cats/veteran_action_medicine.png',
  legacy: '/images/cats/veteran_action_medicine.png'
};

export function normalizeCatImageStage(stage: string): string {
  return stage === 'middleAge' ? 'middle-age' : stage;
}

export function normalizeCatImageStatus(stage: string, status: string): string {
  const normalizedStage = normalizeCatImageStage(stage);

  if (normalizedStage === 'kitten' && status === 'healthy') {
    return 'base';
  }

  if (status === 'action-heal') {
    return 'action-medicine';
  }

  return status;
}

export function getCatImagePath(stage: string, status: string): string {
  const normalizedStage = normalizeCatImageStage(stage);
  const normalizedStatus = normalizeCatImageStatus(stage, status);

  if (normalizedStatus.startsWith('action-')) {
    if (normalizedStatus === 'action-medicine') {
      return (
        medicineImagePathByStage[normalizedStage] ??
        '/images/cats/veteran_action_medicine.png'
      );
    }

    if (
      normalizedStatus === 'action-feed' ||
      normalizedStatus === 'action-play' ||
      normalizedStatus === 'action-wash'
    ) {
      return `/images/cats/${normalizedStatus}.png`;
    }

    if (availableStatusImages[normalizedStage]?.includes(normalizedStatus)) {
      return `/images/cats/${normalizedStage}-${normalizedStatus}.png`;
    }
  }

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
