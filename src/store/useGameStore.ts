// src/store/useGameStore.ts

import { create } from "zustand";
import {
  GameState,
  type Player,
  type Question,
  type StageNumber,
  type SyncPayload,
} from "../types/game";
import initialQuestions from "../data/questions.json";

const SYNC_CHANNEL_NAME = "hcm_quiz_racing_sync";
const broadcastChannel =
  typeof window !== "undefined"
    ? new BroadcastChannel(SYNC_CHANNEL_NAME)
    : null;

interface GameStore {
  // State
  gameState: GameState;
  currentStage: StageNumber;
  currentQuestionIndex: number;
  timeRemaining: number;
  players: Player[];
  questions: Question[];
  activePlayerId: string | null;

  // Actions
  setGameState: (state: GameState) => void;
  registerPlayer: (name: string, carColor: string) => string;
  submitAnswer: (playerId: string, optionIndex: number) => void;
  nextQuestion: () => void;
  resetGame: () => void;
  loadCustomQuestions: (questions: Question[]) => void;
  setActivePlayerId: (id: string) => void;
  tickTimer: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // Broadcast Sync Handler
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event: MessageEvent<SyncPayload>) => {
      const { type, payload } = event.data;
      if (type === "STATE_UPDATE") {
        set(payload);
      }
    };
  }

  const syncState = (newState: Partial<GameStore>) => {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: "STATE_UPDATE",
        payload: newState,
      });
    }
  };

  return {
    gameState: GameState.LOBBY,
    currentStage: 1,
    currentQuestionIndex: 0,
    timeRemaining: 15,
    players: [],
    questions: initialQuestions as Question[],
    activePlayerId: null,

    setActivePlayerId: (id: string) => set({ activePlayerId: id }),

    setGameState: (gameState: GameState) => {
      const stateUpdate = { gameState };
      set(stateUpdate);
      syncState(stateUpdate);
    },

    registerPlayer: (name: string, carColor: string) => {
      const id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newPlayer: Player = {
        id,
        name,
        carColor,
        score: 0,
        hasAnswered: false,
        correctAnswersCount: 0,
      };

      const updatedPlayers = [...get().players, newPlayer];
      const stateUpdate = { players: updatedPlayers };

      set(stateUpdate);
      syncState(stateUpdate);
      return id;
    },

    submitAnswer: (playerId: string, optionIndex: number) => {
      const { questions, currentQuestionIndex, players } = get();
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      const pointsEarned = isCorrect ? currentQuestion.baseScore : 0;

      const updatedPlayers = players.map((player) => {
        if (player.id !== playerId) return player;
        return {
          ...player,
          hasAnswered: true,
          score: player.score + pointsEarned,
          correctAnswersCount: isCorrect
            ? player.correctAnswersCount + 1
            : player.correctAnswersCount,
          lastAnswerCorrect: isCorrect,
        };
      });

      const stateUpdate = { players: updatedPlayers };
      set(stateUpdate);
      syncState(stateUpdate);
    },

    nextQuestion: () => {
      const { currentQuestionIndex, questions, currentStage } = get();
      const nextIndex = currentQuestionIndex + 1;

      // Reset turn status for players
      const resetPlayers = get().players.map((p) => ({
        ...p,
        hasAnswered: false,
        lastAnswerCorrect: undefined,
      }));

      if (nextIndex >= questions.length) {
        const stateUpdate = {
          gameState: GameState.SUMMARY,
          players: resetPlayers,
        };
        set(stateUpdate);
        syncState(stateUpdate);
        return;
      }

      // Progress stages every 2 questions
      const nextStage = Math.min(
        4,
        Math.floor(nextIndex / 2) + 1,
      ) as StageNumber;

      const stateUpdate = {
        currentQuestionIndex: nextIndex,
        currentStage: nextStage,
        timeRemaining: 15,
        players: resetPlayers,
        gameState:
          nextStage !== currentStage
            ? GameState.STAGE_TRANSITION
            : GameState.PLAYING,
      };

      set(stateUpdate);
      syncState(stateUpdate);
    },

    tickTimer: () => {
      const { timeRemaining } = get();
      if (timeRemaining > 0) {
        set({ timeRemaining: timeRemaining - 1 });
      }
    },

    loadCustomQuestions: (customQuestions: Question[]) => {
      const stateUpdate = {
        questions: customQuestions,
        currentQuestionIndex: 0,
        currentStage: 1 as StageNumber,
      };
      set(stateUpdate);
      syncState(stateUpdate);
    },

    resetGame: () => {
      const stateUpdate = {
        gameState: GameState.LOBBY,
        currentStage: 1 as StageNumber,
        currentQuestionIndex: 0,
        timeRemaining: 15,
        players: [],
      };
      set(stateUpdate);
      syncState(stateUpdate);
    },
  };
});
