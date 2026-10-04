// src/services/questionService.ts

import localQuestionRows from "../data/questions.json";
import {
  isSupabaseConfigured,
  supabase,
  mapRowToQuestion,
  type QuestionRow,
} from "../lib/supabase";
import type { Question } from "../types/game";

function getLocalQuestions(): Question[] {
  return localQuestionRows.map((row): Question => ({
    id: row.id,
    question: row.question,
    options: row.options,
    correctIndex: row.correct_index,
    difficulty: row.difficulty as Question["difficulty"],
    baseScore: row.base_score,
    explanation: row.explanation,
  }));
}

export async function fetchQuestions(): Promise<Question[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalQuestions();
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching questions from Supabase:", error);
    throw error;
  }

  return (data as QuestionRow[]).map(mapRowToQuestion);
}

export async function fetchQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard",
): Promise<Question[]> {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalQuestions().filter((question) => question.difficulty === difficulty);
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("difficulty", difficulty);

  if (error) {
    console.error(`Error fetching ${difficulty} questions:`, error);
    throw error;
  }

  return (data as QuestionRow[]).map(mapRowToQuestion);
}
