// src/store/useGameStore.ts

import { create } from "zustand";
import { fetchQuestions } from "../services/questionService";
import { createGameSession, transition } from "../game/gameReducer";
import { organizeQuestionsByStage } from "../game/questionSelector";
import { getTimeLeft } from "../game/timer";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getRoomRoute } from "../lib/roomRouting";
import {
  GameState,
  type GameSession,
  type Player,
  type Question,
  type StageNumber,
  type StageQuestionCounts,
} from "../types/game";
import { DEFAULT_STAGE_QUESTION_COUNTS } from "../game/stages";

const roomRoute = getRoomRoute();
const roomCode = roomRoute.roomCode;
const isAdminClient = roomRoute.isAdmin;
const realtimeRoom = roomCode ? `hcm-quiz-racing-${roomCode}` : null;

type ConnectionStatus = "connecting" | "connected" | "offline" | "error";

interface GameStore extends GameSession {
  isAdmin: boolean;
  connectionStatus: ConnectionStatus;
  availableQuestionCounts: StageQuestionCounts;
  questionsLoaded: boolean;

  startGame: () => void;
  setStageQuestionCount: (stage: StageNumber, count: number) => void;

  pauseGame: () => void;
  resumeGame: () => void;
  submitAnswer: (playerId: string, answerIndex: number) => void;
  revealQuestion: () => void;
  timeExpired: () => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  forceNextStage: () => void;
  continueStage: () => void;
  resetGame: () => void;
  registerPlayer: (name: string, carSprite: string, id: string) => string;
  loadCustomQuestions: (
    questions: Question[],
    stageQuestionCounts?: StageQuestionCounts,
  ) => void;
  getTimeRemaining: (now?: number) => number;

  loadQuestions: () => Promise<void>;

  setGameState: (state: GameState) => void;
}

const initialSession = createGameSession([], {
  stageQuestionCounts: DEFAULT_STAGE_QUESTION_COUNTS,
});

function getAvailableQuestionCounts(questions: Question[]): StageQuestionCounts {
  return {
    1: questions.filter((question) => question.difficulty === "easy").length,
    2: questions.filter((question) => question.difficulty === "medium").length,
    3: questions.filter((question) => question.difficulty === "hard").length,
    4: questions.filter((question) => question.difficulty === "medium").length,
  };
}

function getSession(store: GameStore): GameSession {
  return {
    status: store.status,
    stage: store.stage,
    questions: store.questions,
    stageQuestionCounts: store.stageQuestionCounts,
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
  let questionBank: Question[] = [];

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

  const realtimeChannel =
    isSupabaseConfigured && realtimeRoom
      ? supabase?.channel(realtimeRoom, {
          config: { broadcast: { self: false } },
        })
      : null;

  const store = {
    ...initialSession,
    isAdmin: isAdminClient,
    connectionStatus:
      isSupabaseConfigured && realtimeRoom ? "connecting" : "offline",
    availableQuestionCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
    questionsLoaded: false,

    startGame: () => applyEvent({ type: "START_GAME" }),

    setStageQuestionCount: (stage: StageNumber, count: number) => {
      const current = get();
      if (!isAdminClient || current.status !== GameState.LOBBY) return;
      if (!Number.isInteger(count) || count < 1) return;

      const stageQuestionCounts = {
        ...current.stageQuestionCounts,
        [stage]: count,
      };
      const available = current.availableQuestionCounts;
      if (
        stageQuestionCounts[1] > available[1] ||
        stageQuestionCounts[3] > available[3] ||
        stageQuestionCounts[2] + stageQuestionCounts[4] > available[2]
      ) {
        return;
      }

      const nextSession = createGameSession(
        organizeQuestionsByStage(questionBank, stageQuestionCounts),
        { stageQuestionCounts, players: current.players },
      );
      set(nextSession);
      sync(nextSession);
    },

    pauseGame: () => applyEvent({ type: "PAUSE_GAME" }),

    resumeGame: () => applyEvent({ type: "RESUME_GAME" }),

    submitAnswer: (playerId: string, answerIndex: number) => {
      if (isAdminClient) {
        applyEvent({ type: "SUBMIT_ANSWER", playerId, answerIndex });
      } else {
        broadcast("PLAYER_ANSWER", { playerId, answerIndex });
      }
    },

    revealQuestion: () => applyEvent({ type: "REVEAL_QUESTION" }),

    timeExpired: () => applyEvent({ type: "TIME_EXPIRED" }),

    nextQuestion: () => applyEvent({ type: "NEXT_QUESTION" }),

    skipQuestion: () => applyEvent({ type: "SKIP_QUESTION" }),

    forceNextStage: () => applyEvent({ type: "FORCE_NEXT_STAGE" }),

    continueStage: () => applyEvent({ type: "CONTINUE_STAGE" }),

    resetGame: () => applyEvent({ type: "RESET_GAME" }),

    loadQuestions: async () => {
      if (!isAdminClient) return;

      try {
        questionBank = await fetchQuestions();
        const availableQuestionCounts = getAvailableQuestionCounts(questionBank);
        const nextSession = createGameSession(
          organizeQuestionsByStage(
            questionBank,
            DEFAULT_STAGE_QUESTION_COUNTS,
          ),
          { stageQuestionCounts: DEFAULT_STAGE_QUESTION_COUNTS },
        );

        set({
          ...nextSession,
          availableQuestionCounts,
          questionsLoaded: true,
        });
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

    loadCustomQuestions: (
      questions: Question[],
      stageQuestionCounts = DEFAULT_STAGE_QUESTION_COUNTS,
    ) => {
      if (!isAdminClient) return;

      questionBank = questions;
      const availableQuestionCounts = getAvailableQuestionCounts(questionBank);
      const nextSession = createGameSession(
        organizeQuestionsByStage(questionBank, stageQuestionCounts),
        { stageQuestionCounts },
      );
      set({
        ...nextSession,
        availableQuestionCounts,
        questionsLoaded: true,
      });
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
