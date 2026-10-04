// src/game/questionSelector.ts

import type { Question, StageNumber } from "../types/game";
import { STAGE_DIFFICULTY } from "./stages";

export function selectQuestionsForStage(
  questions: Question[],
  stage: StageNumber,
  questionsPerStage: number,
): Question[] {
  return questions
    .filter((question) => question.difficulty === STAGE_DIFFICULTY[stage])
    .slice(0, questionsPerStage);
}

export function organizeQuestionsByStage(
  questions: Question[],
  questionsPerStage: number,
): Question[] {
  return ([1, 2, 3, 4] as StageNumber[]).flatMap((stage) =>
    selectQuestionsForStage(questions, stage, questionsPerStage),
  );
}
