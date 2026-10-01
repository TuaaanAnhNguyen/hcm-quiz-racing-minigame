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
  durationSeconds?: number;
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

export const GameState = {
  LOBBY: "lobby",
  PLAYING: "playing",
  PAUSED: "paused",
  STAGE_TRANSITION: "stage_transition",
  SUMMARY: "summary",
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export interface AnswerRecord {
  playerId: string;
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  scoreEarned: number;
  timeLeft: number;
}

export interface GameSession {
  status: GameState;
  stage: StageNumber;
  questions: Question[];
  questionsPerStage: number;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  totalTime: number;
  pausedAt: number | null;
  accumulatedPausedDuration: number;
  pendingStage: StageNumber | null;
  players: Player[];
  answerHistory: AnswerRecord[];
}

export type GameEvent =
  | { type: "START_GAME" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "SUBMIT_ANSWER"; playerId: string; answerIndex: number }
  | { type: "TIME_EXPIRED" }
  | { type: "NEXT_QUESTION" }
  | { type: "SKIP_QUESTION" }
  | { type: "FORCE_NEXT_STAGE" }
  | { type: "CONTINUE_STAGE" }
  | { type: "RESET_GAME" };

export interface SyncPayload {
  type: "STATE_UPDATE" | "SUBMIT_ANSWER" | "TRIGGER_ACTION";
  payload: any;
}
