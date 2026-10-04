// src/store/useGameStore.ts

import { create } from "zustand";
import { fetchQuestions } from "../services/questionService";
import { createGameSession, transition } from "../game/gameReducer";
import { organizeQuestionsByStage } from "../game/questionSelector";
import { getTimeLeft } from "../game/timer";
import {
  GameState,
  type GameSession,
  type Player,
  type Question,
} from "../types/game";

const SYNC_CHANNEL_NAME = "hcm_quiz_racing_sync";

const broadcastChannel =
  typeof window !== "undefined"
    ? new BroadcastChannel(SYNC_CHANNEL_NAME)
    : null;

interface GameStore extends GameSession {
  startGame: () => void;

  pauseGame: () => void;
  resumeGame: () => void;
  submitAnswer: (playerId: string, answerIndex: number) => void;
  timeExpired: () => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  forceNextStage: () => void;
  continueStage: () => void;
  resetGame: () => void;
  registerPlayer: (name: string, carSprite: string) => string;
  loadCustomQuestions: (
    questions: Question[],
    questionsPerStage?: number,
  ) => void;
  getTimeRemaining: (now?: number) => number;

  loadQuestions: () => Promise<void>;

  setGameState: (state: GameState) => void;
}

const initialSession = createGameSession([], {
  questionsPerStage: 2,
});

/**
 * Extract only the GameSession data.
 *
 * Zustand's get() also contains all of the store's action functions.
 * Functions cannot be sent through BroadcastChannel.
 */
function getSession(store: GameStore): GameSession {
  return {
    status: store.status,
    stage: store.stage,
    questions: store.questions,
    questionsPerStage: store.questionsPerStage,
    currentQuestionIndex: store.currentQuestionIndex,
    questionStartedAt: store.questionStartedAt,
    totalTime: store.totalTime,
    pausedAt: store.pausedAt,
    accumulatedPausedDuration: store.accumulatedPausedDuration,
    pendingStage: store.pendingStage,
    players: store.players,
    answerHistory: store.answerHistory,
  };
}

export const useGameStore = create<GameStore>((set, get) => {
  /**
   * Send only serializable GameSession data.
   */
  const sync = (session: GameSession) => {
    broadcastChannel?.postMessage({
      type: "STATE_UPDATE",
      payload: session,
    });
  };

  /**
   * Run a game event through A's game state machine.
   */
  const applyEvent = (event: Parameters<typeof transition>[1]) => {
    const current = getSession(get());
    const nextSession = transition(current, event);

    if (nextSession !== current) {
      set(nextSession);
      sync(nextSession);
    }
  };

  broadcastChannel?.addEventListener(
    "message",
    (event: MessageEvent<{ type: string; payload: GameSession }>) => {
      if (event.data?.type === "STATE_UPDATE" && event.data.payload?.status) {
        set(event.data.payload);
      }
    },
  );

  return {
    ...initialSession,

    startGame: () => applyEvent({ type: "START_GAME" }),

    pauseGame: () => applyEvent({ type: "PAUSE_GAME" }),

    resumeGame: () => applyEvent({ type: "RESUME_GAME" }),

    submitAnswer: (playerId, answerIndex) =>
      applyEvent({
        type: "SUBMIT_ANSWER",
        playerId,
        answerIndex,
      }),

    timeExpired: () => applyEvent({ type: "TIME_EXPIRED" }),

    nextQuestion: () => applyEvent({ type: "NEXT_QUESTION" }),

    skipQuestion: () => applyEvent({ type: "SKIP_QUESTION" }),

    forceNextStage: () => applyEvent({ type: "FORCE_NEXT_STAGE" }),

    continueStage: () => applyEvent({ type: "CONTINUE_STAGE" }),

    resetGame: () => applyEvent({ type: "RESET_GAME" }),

    loadQuestions: async () => {
      try {
        const questions = await fetchQuestions();

        const nextSession = createGameSession(
          organizeQuestionsByStage(questions, 2),
          {
            questionsPerStage: 2,
          },
        );

        set(nextSession);
        sync(nextSession);
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    },

    registerPlayer: (name, carSprite) => {
      const current = getSession(get());

      const id = `player_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      const player: Player = {
        id,
        name,
        carSprite,
        score: 0,
        hasAnswered: false,
        correctAnswersCount: 0,
      };

      const nextSession: GameSession = {
        ...current,
        players: [...current.players, player],
      };

      set(nextSession);
      sync(nextSession);

      return id;
    },

    loadCustomQuestions: (questions, questionsPerStage = 2) => {
      const nextSession = createGameSession(
        organizeQuestionsByStage(questions, questionsPerStage),
        { questionsPerStage },
      );

      set(nextSession);
      sync(nextSession);
    },

    getTimeRemaining: (now) => getTimeLeft(getSession(get()), now),

    setGameState: (state) => {
      if (state === GameState.LOBBY) {
        return applyEvent({ type: "RESET_GAME" });
      }

      if (state === GameState.PLAYING) {
        return applyEvent({
          type: get().status === GameState.LOBBY ? "START_GAME" : "RESUME_GAME",
        });
      }

      if (state === GameState.PAUSED) {
        return applyEvent({ type: "PAUSE_GAME" });
      }

      if (state === GameState.STAGE_TRANSITION) {
        return applyEvent({ type: "FORCE_NEXT_STAGE" });
      }

      return applyEvent({ type: "FORCE_NEXT_STAGE" });
    },
  };
});
