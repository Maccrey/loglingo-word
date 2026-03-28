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

const actionImagePathByStage: Record<string, Partial<Record<string, string>>> = {
  kitten: {
    'action-feed': '/images/cats/kitten-action-feed.png',
    'action-play': '/images/cats/kitten-action-play.png',
    'action-wash': '/images/cats/kitten-action-wash.png'
  },
  junior: {
    'action-feed': '/images/cats/junior-action-feed.png',
    'action-play': '/images/cats/junior-action-play.png',
    'action-wash': '/images/cats/junior-action-wash.png'
  },
  adult: {
    'action-feed': '/images/cats/adult-action-feed.png',
    'action-play': '/images/cats/adult-action-play.png',
    'action-wash': '/images/cats/adult-action-wash.png'
  },
  'middle-age': {
    'action-feed': '/images/cats/middle-age-action-feed.png',
    'action-play': '/images/cats/middle-age-action-play.png',
    'action-wash': '/images/cats/middle-age-action-wash.png'
  },
  senior: {
    'action-feed': '/images/cats/senior-action-feed.png',
    'action-play': '/images/cats/senior-action-play.png',
    'action-wash': '/images/cats/senior-action-wash.png'
  },
  veteran: {
    'action-feed': '/images/cats/veteran-action-feed.png',
    'action-play': '/images/cats/veteran-action-play.png',
    'action-wash': '/images/cats/veteran-action-wash.png'
  },
  legacy: {}
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

    const stageActionImage =
      actionImagePathByStage[normalizedStage]?.[normalizedStatus];

    if (stageActionImage) {
      return stageActionImage;
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
      const fallbackActionImage =
        actionImagePathByStage[fallbackStage]?.[normalizedStatus];
      if (fallbackActionImage) {
        return fallbackActionImage;
      }
      if (availableStatusImages[fallbackStage]?.includes(normalizedStatus)) {
        return `/images/cats/${fallbackStage}-${normalizedStatus}.png`;
      }
    }
  }

  return '/images/cats/kitten-base.png';
}
