// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";
import type { Question } from "../types/game";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export interface QuestionRow {
  id: string;
  question: string;
  options_0: string;
  options_1: string;
  options_2: string;
  options_3: string;
  correct_index: number;
  difficulty: "easy" | "medium" | "hard";
  base_score: number;
  duration_seconds: number;
  explanation: string | null;
  created_at: string;
}

export function mapRowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    question: row.question,
    options: [row.options_0, row.options_1, row.options_2, row.options_3],
    correctIndex: row.correct_index,
    difficulty: row.difficulty,
    durationSeconds: row.duration_seconds,
    baseScore: row.base_score,
    explanation: row.explanation ?? undefined,
  };
}
