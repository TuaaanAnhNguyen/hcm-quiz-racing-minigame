import type { GameSession } from "../types/game";

export function getTimeLeft(session: GameSession, now = Date.now()): number {
  if (session.questionStartedAt === null) return session.totalTime;

  const pausedDuration = session.accumulatedPausedDuration +
    (session.pausedAt === null ? 0 : Math.max(0, now - session.pausedAt));
  const elapsedSeconds = Math.max(
    0,
    (now - session.questionStartedAt - pausedDuration) / 1000,
  );

  return Math.max(0, session.totalTime - elapsedSeconds);
}