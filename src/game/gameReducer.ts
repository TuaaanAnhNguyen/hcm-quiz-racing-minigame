// src/game/gameReducer.ts

import type {
  AnswerRecord,
  GameEvent,
  GameSession,
  Player,
  Question,
  StageNumber,
} from "../types/game";
import { GameState } from "../types/game";
import { calculateScore } from "./scoring";
import { getStageForQuestionIndex } from "./stages";
import { getTimeLeft } from "./timer";

function resetPlayers(players: Player[]): Player[] {
  return players.map((player) => ({
    ...player,
    hasAnswered: false,
    lastAnswerCorrect: undefined,
  }));
}

function startQuestion(session: GameSession, now: number): GameSession {
  return {
    ...session,
    status: GameState.PLAYING,
    questionStartedAt: now,
    pausedAt: null,
    accumulatedPausedDuration: 0,
    pendingStage: null,
    players: resetPlayers(session.players),
  };
}

function finishQuestion(
  session: GameSession,
  now: number,
  recordUnanswered = false,
): GameSession {
  const question = session.questions[session.currentQuestionIndex];
  const answerHistory =
    recordUnanswered && question
      ? [
          ...session.answerHistory,
          ...session.players
            .filter((player) => !player.hasAnswered)
            .map(
              (player): AnswerRecord => ({
                playerId: player.id,
                questionId: question.id,
                selectedIndex: null,
                correct: false,
                scoreEarned: 0,
                timeLeft: 0,
              }),
            ),
        ]
      : session.answerHistory;
  const sessionWithHistory = { ...session, answerHistory };
  const nextIndex = session.currentQuestionIndex + 1;
  if (nextIndex >= session.questions.length) {
    return {
      ...sessionWithHistory,
      status: GameState.STAGE_TRANSITION,
      questionStartedAt: null,
      pausedAt: null,
      pendingStage: null,
      players: resetPlayers(session.players),
    };
  }

  const nextStage = getStageForQuestionIndex(
    nextIndex,
    session.questionsPerStage,
  );
  if (nextStage !== session.stage) {
    return {
      ...sessionWithHistory,
      status: GameState.STAGE_TRANSITION,
      stage: nextStage,
      currentQuestionIndex: nextIndex,
      questionStartedAt: null,
      pausedAt: null,
      pendingStage: nextStage,
      players: resetPlayers(session.players),
    };
  }

  return startQuestion(
    {
      ...sessionWithHistory,
      currentQuestionIndex: nextIndex,
      players: resetPlayers(session.players),
    },
    now,
  );
}

function nextStageIndex(
  session: GameSession,
): { index: number; stage: StageNumber } | null {
  if (session.stage >= 4) return null;
  const stage = (session.stage + 1) as StageNumber;
  return {
    stage,
    index:
      stage === 1
        ? 0
        : stage * session.questionsPerStage - session.questionsPerStage,
  };
}

export function transition(
  session: GameSession,
  event: GameEvent,
  now = Date.now(),
): GameSession {
  switch (event.type) {
    case "START_GAME":
      return session.status === GameState.LOBBY && session.questions.length > 0
        ? startQuestion({ ...session, stage: 1, currentQuestionIndex: 0 }, now)
        : session;
    case "PAUSE_GAME":
      return session.status === GameState.PLAYING
        ? { ...session, status: GameState.PAUSED, pausedAt: now }
        : session;
    case "RESUME_GAME":
      return session.status === GameState.PAUSED && session.pausedAt !== null
        ? {
            ...session,
            status: GameState.PLAYING,
            accumulatedPausedDuration:
              session.accumulatedPausedDuration + now - session.pausedAt,
            pausedAt: null,
          }
        : session;
    case "SUBMIT_ANSWER": {
      if (session.status !== GameState.PLAYING) return session;
      const question = session.questions[session.currentQuestionIndex];
      const player = session.players.find(
        (candidate) => candidate.id === event.playerId,
      );
      if (
        !question ||
        !player ||
        player.hasAnswered ||
        event.answerIndex < 0 ||
        event.answerIndex >= question.options.length
      ) {
        return session;
      }

      const timeLeft = getTimeLeft(session, now);
      const correct = event.answerIndex === question.correctIndex;
      const scoreEarned = calculateScore({
        stage: session.stage,
        correct,
        baseScore: question.baseScore,
        timeLeft,
        totalTime: question.durationSeconds ?? session.totalTime,
      });
      const answer: AnswerRecord = {
        playerId: event.playerId,
        questionId: question.id,
        selectedIndex: event.answerIndex,
        correct,
        scoreEarned,
        timeLeft,
      };
      const players = session.players.map((candidate) =>
        candidate.id === event.playerId
          ? {
              ...candidate,
              hasAnswered: true,
              score: candidate.score + scoreEarned,
              correctAnswersCount:
                candidate.correctAnswersCount + (correct ? 1 : 0),
              lastAnswerCorrect: correct,
            }
          : candidate,
      );
      const updated = {
        ...session,
        players,
        answerHistory: [...session.answerHistory, answer],
      };
      return players.length > 0 &&
        players.every((candidate) => candidate.hasAnswered)
        ? finishQuestion(updated, now)
        : updated;
    }
    case "TIME_EXPIRED":
      return session.status === GameState.PLAYING &&
        getTimeLeft(session, now) <= 0
        ? finishQuestion(session, now, true)
        : session;
    case "NEXT_QUESTION":
    case "SKIP_QUESTION":
      return session.status === GameState.PLAYING ||
        session.status === GameState.PAUSED
        ? finishQuestion(session, now)
        : session;
    case "FORCE_NEXT_STAGE": {
      if (
        session.status !== GameState.PLAYING &&
        session.status !== GameState.PAUSED
      )
        return session;
      const next = nextStageIndex(session);
      return next === null
        ? {
            ...session,
            status: GameState.STAGE_TRANSITION,
            questionStartedAt: null,
            pausedAt: null,
            pendingStage: null,
          }
        : {
            ...session,
            status: GameState.STAGE_TRANSITION,
            stage: next.stage,
            currentQuestionIndex: next.index,
            questionStartedAt: null,
            pausedAt: null,
            pendingStage: next.stage,
            players: resetPlayers(session.players),
          };
    }
    case "CONTINUE_STAGE":
      return session.status === GameState.STAGE_TRANSITION
        ? session.pendingStage === null
          ? { ...session, status: GameState.SUMMARY, questionStartedAt: null }
          : startQuestion(session, now)
        : session;
    case "RESET_GAME":
      return {
        ...session,
        status: GameState.LOBBY,
        stage: 1,
        currentQuestionIndex: 0,
        questionStartedAt: null,
        pausedAt: null,
        accumulatedPausedDuration: 0,
        pendingStage: null,
        players: [],
        answerHistory: [],
      };
  }
}

export function createGameSession(
  questions: Question[],
  options: {
    totalTime?: number;
    questionsPerStage?: number;
    players?: Player[];
  } = {},
): GameSession {
  return {
    status: GameState.LOBBY,
    stage: 1,
    questions,
    questionsPerStage: options.questionsPerStage ?? 2,
    currentQuestionIndex: 0,
    questionStartedAt: null,
    totalTime: options.totalTime ?? 15,
    pausedAt: null,
    accumulatedPausedDuration: 0,
    pendingStage: null,
    players: options.players ?? [],
    answerHistory: [],
  };
}
