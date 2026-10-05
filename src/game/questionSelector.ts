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
  const firstStage = selectQuestionsForStage(questions, 1, questionsPerStage);
  const secondStage = selectQuestionsForStage(questions, 2, questionsPerStage);
  const thirdStage = selectQuestionsForStage(questions, 3, questionsPerStage);
  const usedMediumQuestionIds = new Set(secondStage.map((question) => question.id));
  const fourthStage = questions
    .filter(
      (question) =>
        question.difficulty === STAGE_DIFFICULTY[4] &&
        !usedMediumQuestionIds.has(question.id),
    )
    .slice(0, questionsPerStage);

  return [...firstStage, ...secondStage, ...thirdStage, ...fourthStage];
}
