// src/game/questionSelector.ts

import type {
  Question,
  StageNumber,
  StageQuestionCounts,
} from "../types/game";
import { STAGE_DIFFICULTY } from "./stages";

export function selectQuestionsForStage(
  questions: Question[],
  stage: StageNumber,
  questionCount: number,
  excludedQuestionIds: ReadonlySet<string> = new Set(),
): Question[] {
  return questions
    .filter(
      (question) =>
        question.difficulty === STAGE_DIFFICULTY[stage] &&
        !excludedQuestionIds.has(question.id),
    )
    .slice(0, questionCount);
}

export function organizeQuestionsByStage(
  questions: Question[],
  stageQuestionCounts: StageQuestionCounts,
): Question[] {
  const selected: Question[] = [];
  const usedQuestionIds = new Set<string>();

  for (const stage of [1, 2, 3, 4] as const) {
    const stageQuestions = selectQuestionsForStage(
      questions,
      stage,
      stageQuestionCounts[stage],
      usedQuestionIds,
    );
    selected.push(...stageQuestions);
    stageQuestions.forEach((question) => usedQuestionIds.add(question.id));
  }

  return selected;
}
