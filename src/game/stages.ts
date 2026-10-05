// src/game/stages.ts

import type { StageNumber } from "../types/game";

export const STAGE_DIFFICULTY: Record<StageNumber, "easy" | "medium" | "hard"> = {
  1: "easy",
  2: "medium",
  3: "hard",
  4: "medium",
};

export const DEFAULT_TOTAL_TIME = 15;
export const DEFAULT_QUESTIONS_PER_STAGE = 2;

export function getStageForQuestionIndex(
  questionIndex: number,
  questionsPerStage: number,
): StageNumber {
  return Math.min(4, Math.floor(questionIndex / questionsPerStage) + 1) as StageNumber;
}