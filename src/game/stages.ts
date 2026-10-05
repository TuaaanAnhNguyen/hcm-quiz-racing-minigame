// src/game/stages.ts

import type { StageNumber, StageQuestionCounts } from "../types/game";

export const STAGE_DIFFICULTY: Record<StageNumber, "easy" | "medium" | "hard"> = {
  1: "easy",
  2: "medium",
  3: "hard",
  4: "medium",
};

export const DEFAULT_TOTAL_TIME = 15;
export const DEFAULT_STAGE_QUESTION_COUNTS: StageQuestionCounts = {
  1: 5,
  2: 5,
  3: 5,
  4: 5,
};

export function getStageForQuestionIndex(
  questionIndex: number,
  stageQuestionCounts: StageQuestionCounts,
): StageNumber {
  let stageStartIndex = 0;

  for (const stage of [1, 2, 3, 4] as const) {
    stageStartIndex += stageQuestionCounts[stage];
    if (questionIndex < stageStartIndex) return stage;
  }

  return 4;
}

export function getStageStartIndex(
  targetStage: StageNumber,
  stageQuestionCounts: StageQuestionCounts,
): number {
  let stageStartIndex = 0;

  for (const stage of [1, 2, 3, 4] as const) {
    if (stage === targetStage) return stageStartIndex;
    stageStartIndex += stageQuestionCounts[stage];
  }

  return stageStartIndex;
}