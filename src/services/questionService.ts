// src/services/questionService.ts

import { supabase, mapRowToQuestion, type QuestionRow } from "../lib/supabase";
import type { Question } from "../types/game";

export async function fetchQuestions(): Promise<Question[]> {
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
