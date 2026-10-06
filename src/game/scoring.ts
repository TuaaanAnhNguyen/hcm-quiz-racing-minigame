// src/game/scoring.ts

import type { StageNumber } from "../types/game";

export interface ScoreInput {
  stage: StageNumber;
  correct: boolean;
  baseScore: number;
  timeLeft: number;
  totalTime: number;
}

export function calculateScore({
  stage,
  correct,
  baseScore,
  timeLeft,
  totalTime,
}: ScoreInput): number {
  const boundedTime = Math.max(0, Math.min(timeLeft, totalTime));
  const dynamicScore = Math.floor(
    baseScore + (baseScore * boundedTime) / totalTime,
  );

  switch (stage) {
    case 1:
      return correct ? baseScore : 0;
    case 2:
      return correct ? dynamicScore : 0;
    case 3:
      return correct ? dynamicScore : -dynamicScore;
    case 4:
      return correct ? baseScore : -baseScore;
    default:
      return 0;
  }
}
