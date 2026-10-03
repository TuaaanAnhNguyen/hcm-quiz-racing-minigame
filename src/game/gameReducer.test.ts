import { describe, expect, it } from "vitest";
import { createGameSession, transition } from "./gameReducer";
import { calculateScore } from "./scoring";
import { getTimeLeft } from "./timer";
import { GameState, type Player, type Question } from "../types/game";

const questions: Question[] = [1, 2, 3, 4].map((stage) => ({
  id: `q${stage}`,
  question: `Question ${stage}`,
  options: ["A", "B"],
  correctIndex: 0,
  difficulty: stage === 1 ? "easy" : stage === 3 ? "hard" : "medium",
  baseScore: 100,
}));

const player = (id: string): Player => ({
  id,
  name: id,
  carColor: "red",
  score: 0,
  hasAnswered: false,
  correctAnswersCount: 0,
});

describe("calculateScore", () => {
  it("applies each stage rule", () => {
    expect(calculateScore({ stage: 1, correct: true, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(100);
    expect(calculateScore({ stage: 1, correct: false, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(0);
    expect(calculateScore({ stage: 2, correct: true, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(133);
    expect(calculateScore({ stage: 2, correct: false, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(133);
    expect(calculateScore({ stage: 3, correct: true, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(133);
    expect(calculateScore({ stage: 3, correct: false, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(-133);
    expect(calculateScore({ stage: 4, correct: true, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(100);
    expect(calculateScore({ stage: 4, correct: false, baseScore: 100, timeLeft: 5, totalTime: 15 })).toBe(-100);
  });
});

describe("game state machine", () => {
  it("allows only valid lifecycle transitions", () => {
    const initial = createGameSession(questions, { questionsPerStage: 1, players: [player("a")] });
    expect(transition(initial, { type: "SUBMIT_ANSWER", playerId: "a", answerIndex: 0 }, 0)).toBe(initial);

    const playing = transition(initial, { type: "START_GAME" }, 0);
    expect(playing.status).toBe(GameState.PLAYING);
    expect(transition(playing, { type: "PAUSE_GAME" }, 1000).status).toBe(GameState.PAUSED);
    expect(transition(transition(playing, { type: "PAUSE_GAME" }, 1000), { type: "RESUME_GAME" }, 5000).status).toBe(GameState.PLAYING);
  });

  it("records one answer, rejects duplicates, and enters stage transition", () => {
    const initial = createGameSession(questions, { questionsPerStage: 1, players: [player("a")] });
    const playing = transition(initial, { type: "START_GAME" }, 0);
    const answered = transition(playing, { type: "SUBMIT_ANSWER", playerId: "a", answerIndex: 0 }, 1000);

    expect(answered.status).toBe(GameState.STAGE_TRANSITION);
    expect(answered.answerHistory).toHaveLength(1);
    expect(answered.players[0].score).toBe(100);
    expect(transition(answered, { type: "SUBMIT_ANSWER", playerId: "a", answerIndex: 0 }, 2000)).toBe(answered);
  });

  it("allows the host to force the next stage", () => {
    const initial = createGameSession(questions, { questionsPerStage: 1, players: [player("a")] });
    const playing = transition(initial, { type: "START_GAME" }, 0);
    const transitionState = transition(playing, { type: "FORCE_NEXT_STAGE" }, 1000);

    expect(transitionState.status).toBe(GameState.STAGE_TRANSITION);
    expect(transitionState.stage).toBe(2);
    expect(transitionState.currentQuestionIndex).toBe(1);
    expect(transitionState.pendingStage).toBe(2);

    const nextStage = transition(transitionState, { type: "CONTINUE_STAGE" }, 2000);
    expect(nextStage.status).toBe(GameState.PLAYING);
    expect(nextStage.currentQuestionIndex).toBe(1);
  });

  it("does not count paused time", () => {
    const initial = createGameSession(questions, { players: [player("a")] });
    const playing = transition(initial, { type: "START_GAME" }, 0);
    const paused = transition(playing, { type: "PAUSE_GAME" }, 5000);
    expect(getTimeLeft(paused, 10000)).toBe(10);
    expect(getTimeLeft(transition(paused, { type: "RESUME_GAME" }, 10000), 11000)).toBe(9);
  });

  it("moves from the final stage transition to summary and resets cleanly", () => {
    let state = createGameSession(questions, { questionsPerStage: 1, players: [player("a")] });
    state = transition(state, { type: "START_GAME" }, 0);
    for (let index = 0; index < 4; index += 1) {
      state = transition(state, { type: "SUBMIT_ANSWER", playerId: "a", answerIndex: 0 }, index * 1000);
      if (state.status === GameState.STAGE_TRANSITION) {
        state = transition(state, { type: "CONTINUE_STAGE" }, index * 1000 + 1);
      }
    }
    expect(state.status).toBe(GameState.SUMMARY);
    expect(transition(state, { type: "PAUSE_GAME" })).toBe(state);
    const reset = transition(state, { type: "RESET_GAME" });
    expect(reset.status).toBe(GameState.LOBBY);
    expect(reset.answerHistory).toHaveLength(0);
    expect(reset.players).toHaveLength(0);
  });
});