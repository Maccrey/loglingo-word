'use client';

import { useEffect, useRef, useState } from 'react';

const FIRST_REWARD_MINUTES = 15;
const REPEAT_REWARD_MINUTES = 5;
const FIRST_REWARD_POINTS = 500;
const REPEAT_REWARD_POINTS = Math.round(FIRST_REWARD_POINTS / 3);

function getMilestoneCount(elapsedMinutes: number) {
  if (elapsedMinutes < FIRST_REWARD_MINUTES) {
    return 0;
  }

  return 1 + Math.floor((elapsedMinutes - FIRST_REWARD_MINUTES) / REPEAT_REWARD_MINUTES);
}

export function calculateTimedLearningRewardPoints(milestoneCount: number) {
  if (milestoneCount <= 0) {
    return 0;
  }

  return FIRST_REWARD_POINTS + (milestoneCount - 1) * REPEAT_REWARD_POINTS;
}

export function useTimedLearningReward(input: {
  active: boolean;
  grantPoints: (points: number) => number;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const awardedMilestonesRef = useRef(0);

  useEffect(() => {
    if (!input.active) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [input.active]);

  useEffect(() => {
    if (!input.active) {
      return;
    }

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const currentMilestones = getMilestoneCount(elapsedMinutes);

    if (currentMilestones <= awardedMilestonesRef.current) {
      return;
    }

    const awardedPoints =
      calculateTimedLearningRewardPoints(currentMilestones) -
      calculateTimedLearningRewardPoints(awardedMilestonesRef.current);

    awardedMilestonesRef.current = currentMilestones;

    if (awardedPoints > 0) {
      input.grantPoints(awardedPoints);
    }
  }, [elapsedSeconds, input.active, input.grantPoints]);

  useEffect(() => {
    if (input.active) {
      return;
    }

    setElapsedSeconds(0);
    awardedMilestonesRef.current = 0;
  }, [input.active]);

  return {
    elapsedSeconds
  };
}
