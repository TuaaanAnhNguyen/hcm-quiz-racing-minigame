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
  if (stage === 1) return correct ? baseScore : 0;
  if (stage === 4) return correct ? baseScore : -baseScore;

  const boundedTime = Math.max(0, Math.min(timeLeft, totalTime));
  const dynamicScore = Math.floor(baseScore + (baseScore * boundedTime) / totalTime);
  return correct || stage === 2 ? dynamicScore : -dynamicScore;
}