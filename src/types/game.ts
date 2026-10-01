// src/types/game.ts

export type StageNumber = 1 | 2 | 3 | 4;

export interface StageInfo {
  number: StageNumber;
  name: string;
  themeColor: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number; // 0, 1, 2, or 3 (A, B, C, D)
  difficulty: "easy" | "medium" | "hard";
  baseScore: number;
  explanation?: string;
}

export interface Player {
  id: string;
  name: string;
  carColor: string;
  score: number;
  hasAnswered: boolean;
  correctAnswersCount: number;
  lastAnswerCorrect?: boolean;
}

export enum GameState {
  LOBBY = "lobby",
  PLAYING = "playing",
  PAUSED = "paused",
  STAGE_TRANSITION = "stage_transition",
  SUMMARY = "summary",
}

export interface SyncPayload {
  type: "STATE_UPDATE" | "SUBMIT_ANSWER" | "TRIGGER_ACTION";
  payload: any;
}
