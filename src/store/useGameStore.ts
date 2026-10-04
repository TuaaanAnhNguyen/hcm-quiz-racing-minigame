// src/store/useGameStore.ts

import { create } from "zustand";
import { fetchQuestions } from "../services/questionService";
import { createGameSession, transition } from "../game/gameReducer";
import { organizeQuestionsByStage } from "../game/questionSelector";
import { getTimeLeft } from "../game/timer";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  GameState,
  type GameSession,
  type Player,
  type Question,
} from "../types/game";

const REALTIME_ROOM = "hcm-quiz-racing-room";
const isAdminClient =
  typeof window !== "undefined" && /^\/admin\/?$/.test(window.location.pathname);

type ConnectionStatus = "connecting" | "connected" | "offline" | "error";

interface GameStore extends GameSession {
  isAdmin: boolean;
  connectionStatus: ConnectionStatus;

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
  registerPlayer: (name: string, carSprite: string, id: string) => string;
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
  let realtimeReady = false;

  const broadcast = (event: string, payload: unknown) => {
    if (realtimeReady) {
      void realtimeChannel?.send({ type: "broadcast", event, payload });
    }
  };

  const sync = (session: GameSession) => {
    if (isAdminClient) {
      broadcast("STATE_UPDATE", session);
    }
  };

  const applyEvent = (event: Parameters<typeof transition>[1]) => {
    if (!isAdminClient) return;

    const current = getSession(get());
    const nextSession = transition(current, event);

    if (nextSession !== current) {
      set(nextSession);
      sync(nextSession);
    }
  };

  const addPlayer = (player: Player) => {
    const current = getSession(get());
    if (
      !isAdminClient ||
      current.status === GameState.SUMMARY ||
      current.players.some((candidate) => candidate.id === player.id)
    ) {
      return;
    }

    const nextSession = { ...current, players: [...current.players, player] };
    set(nextSession);
    sync(nextSession);
  };

  const realtimeChannel = isSupabaseConfigured
    ? supabase?.channel(REALTIME_ROOM, {
        config: { broadcast: { self: false } },
      })
    : null;

  const store = {
    ...initialSession,
    isAdmin: isAdminClient,
    connectionStatus: isSupabaseConfigured ? "connecting" : "offline",

    startGame: () => applyEvent({ type: "START_GAME" }),

    pauseGame: () => applyEvent({ type: "PAUSE_GAME" }),

    resumeGame: () => applyEvent({ type: "RESUME_GAME" }),

    submitAnswer: (playerId: string, answerIndex: number) => {
      if (isAdminClient) {
        applyEvent({ type: "SUBMIT_ANSWER", playerId, answerIndex });
      } else {
        broadcast("PLAYER_ANSWER", { playerId, answerIndex });
      }
    },

    timeExpired: () => applyEvent({ type: "TIME_EXPIRED" }),

    nextQuestion: () => applyEvent({ type: "NEXT_QUESTION" }),

    skipQuestion: () => applyEvent({ type: "SKIP_QUESTION" }),

    forceNextStage: () => applyEvent({ type: "FORCE_NEXT_STAGE" }),

    continueStage: () => applyEvent({ type: "CONTINUE_STAGE" }),

    resetGame: () => applyEvent({ type: "RESET_GAME" }),

    loadQuestions: async () => {
      if (!isAdminClient) return;

      try {
        const questions = await fetchQuestions();
        const nextSession = createGameSession(
          organizeQuestionsByStage(questions, 2),
          { questionsPerStage: 2 },
        );

        set(nextSession);
        sync(nextSession);
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    },

    registerPlayer: (name: string, carSprite: string, id: string) => {
      const player: Player = {
        id,
        name,
        carSprite,
        score: 0,
        hasAnswered: false,
        correctAnswersCount: 0,
      };

      if (isAdminClient) {
        addPlayer(player);
      } else {
        broadcast("PLAYER_JOIN", player);
      }

      return id;
    },

    loadCustomQuestions: (questions: Question[], questionsPerStage = 2) => {
      if (!isAdminClient) return;

      const nextSession = createGameSession(
        organizeQuestionsByStage(questions, questionsPerStage),
        { questionsPerStage },
      );
      set(nextSession);
      sync(nextSession);
    },

    getTimeRemaining: (now?: number) => getTimeLeft(getSession(get()), now),

    setGameState: (state: GameState) => {
      if (!isAdminClient) return;

      if (state === GameState.LOBBY) {
        applyEvent({ type: "RESET_GAME" });
      } else if (state === GameState.PLAYING) {
        applyEvent({
          type: get().status === GameState.LOBBY ? "START_GAME" : "RESUME_GAME",
        });
      } else if (state === GameState.PAUSED) {
        applyEvent({ type: "PAUSE_GAME" });
      } else if (state === GameState.STAGE_TRANSITION) {
        applyEvent({ type: "FORCE_NEXT_STAGE" });
      }
    },
  } satisfies Omit<GameStore, keyof GameSession> & Partial<GameSession>;

  realtimeChannel
    ?.on("broadcast", { event: "STATE_UPDATE" }, ({ payload }) => {
      if (!isAdminClient && payload?.status) {
        set(payload as GameSession);
      }
    })
    .on("broadcast", { event: "PLAYER_JOIN" }, ({ payload }) => {
      if (isAdminClient && payload?.id && payload?.name && payload?.carSprite) {
        addPlayer(payload as Player);
      }
    })
    .on("broadcast", { event: "PLAYER_ANSWER" }, ({ payload }) => {
      if (
        isAdminClient &&
        typeof payload?.playerId === "string" &&
        Number.isInteger(payload?.answerIndex)
      ) {
        applyEvent({
          type: "SUBMIT_ANSWER",
          playerId: payload.playerId,
          answerIndex: payload.answerIndex,
        });
      }
    })
    .on("broadcast", { event: "STATE_REQUEST" }, () => {
      if (isAdminClient) sync(getSession(get()));
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        realtimeReady = true;
        set({ connectionStatus: "connected" });
        if (isAdminClient) {
          sync(getSession(get()));
        } else {
          broadcast("STATE_REQUEST", {});
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        realtimeReady = false;
        set({ connectionStatus: "error" });
      } else if (status === "CLOSED") {
        realtimeReady = false;
        set({ connectionStatus: "offline" });
      }
    });

  return store as GameStore;
});
