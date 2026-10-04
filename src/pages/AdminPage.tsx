// src/pages/AdminPage.tsx

import { useCallback, useState } from "react";
import { Flag, Play, RotateCcw, SkipForward, Pause, Copy } from "lucide-react";
import SpectatorView from "../components/game/SpectatorView";
import { useGameStore } from "../store/useGameStore";
import { GameState } from "../types/game";
import { getRoomRoute } from "../lib/roomRouting";

function AdminPage() {
  const status = useGameStore((state) => state.status);
  const stage = useGameStore((state) => state.stage);
  const questions = useGameStore((state) => state.questions);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const questionsPerStage = useGameStore((state) => state.questionsPerStage);
  const players = useGameStore((state) => state.players);
  const connectionStatus = useGameStore((state) => state.connectionStatus);
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const timeExpired = useGameStore((state) => state.timeExpired);
  const nextQuestion = useGameStore((state) => state.nextQuestion);
  const skipQuestion = useGameStore((state) => state.skipQuestion);
  const forceNextStage = useGameStore((state) => state.forceNextStage);
  const continueStage = useGameStore((state) => state.continueStage);
  const resetGame = useGameStore((state) => state.resetGame);
  const getTimeRemaining = useGameStore((state) => state.getTimeRemaining);

  const { roomCode } = getRoomRoute();
  const [copiedItem, setCopiedItem] = useState<"code" | "link" | null>(null);

  const inviteUrl = roomCode ? `${window.location.origin}/${roomCode}` : "";

  const handleCopy = async (value: string, item: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(item);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleExpire = useCallback(() => {
    if (status === GameState.PLAYING) timeExpired();
  }, [status, timeExpired]);

  const currentQuestion = questions[currentQuestionIndex];
  const controlEnabled = connectionStatus === "connected";

  return (
    <main className="game-page admin-page">
      <section className="game-card spectator-card">
        <header className="spectator-header">
          <div>
            <p className="eyebrow">HCM QUIZ RACING · ADMIN</p>
            <h1>Race Control</h1>
            <p className="spectator-subtitle">
              Stage {stage} · {status.replaceAll("_", " ")} · {players.length}{" "}
              racers
            </p>
          </div>
          <div className="spectator-header-actions">
            <span
              className={`connection-status connection-${connectionStatus}`}
            >
              {connectionStatus === "connected"
                ? "Realtime connected"
                : connectionStatus === "offline"
                  ? "Realtime not configured"
                  : connectionStatus}
            </span>
          </div>
        </header>

        {roomCode && (
          <section className="room-invite-panel">
            <div className="room-invite-info">
              <p className="eyebrow">INVITE PLAYERS</p>
              <h2>Room code</h2>
              <p>
                Share this code with your players so they can join your race.
              </p>

              <div className="room-code-display">{roomCode}</div>
            </div>

            <div className="room-invite-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => void handleCopy(roomCode, "code")}
              >
                <Copy size={16} aria-hidden="true" />
                {copiedItem === "code" ? "Code copied!" : "Copy room code"}
              </button>

              <div className="room-invite-link">
                <label htmlFor="player-invite-url">
                  PLAYER INVITATION LINK
                </label>
                <input
                  id="player-invite-url"
                  type="text"
                  value={inviteUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void handleCopy(inviteUrl, "link")}
                >
                  <Copy size={16} aria-hidden="true" />
                  {copiedItem === "link" ? "Link copied!" : "Copy invite link"}
                </button>
              </div>
            </div>
          </section>
        )}

        {!controlEnabled && (
          <p className="admin-notice">
            Configure Supabase Realtime to connect player browsers. The admin
            remains the only game-state authority.
          </p>
        )}

        <section className="host-controls" aria-label="Race controls">
          <div>
            <p className="eyebrow">RACE CONTROL</p>
            <strong>
              {currentQuestion?.question ??
                (status === GameState.LOBBY
                  ? "Waiting in the grid"
                  : "Race complete")}
            </strong>
          </div>
          <div className="host-control-actions">
            {status === GameState.LOBBY && (
              <button
                type="button"
                className="primary-button"
                onClick={startGame}
                disabled={!questions.length || !players.length}
              >
                <Play size={16} aria-hidden="true" />
                Start race
              </button>
            )}
            {status === GameState.PLAYING && (
              <button
                type="button"
                className="secondary-button"
                onClick={pauseGame}
              >
                <Pause size={16} aria-hidden="true" />
                Pause
              </button>
            )}
            {status === GameState.PAUSED && (
              <button
                type="button"
                className="primary-button"
                onClick={resumeGame}
              >
                <Play size={16} aria-hidden="true" />
                Resume
              </button>
            )}
            {status === GameState.QUESTION_RESULT && (
              <button
                type="button"
                className="primary-button"
                onClick={nextQuestion}
              >
                <Play size={16} aria-hidden="true" />
                Next question
              </button>
            )}
            {status === GameState.STAGE_TRANSITION && (
              <button
                type="button"
                className="primary-button"
                onClick={continueStage}
              >
                <Play size={16} aria-hidden="true" />
                {stage === 4 ? "View results" : "Continue stage"}
              </button>
            )}
            {(status === GameState.PLAYING || status === GameState.PAUSED) && (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={skipQuestion}
                >
                  <SkipForward size={16} aria-hidden="true" />
                  Skip question
                </button>
                <button
                  type="button"
                  className="primary-button host-force-button"
                  onClick={forceNextStage}
                >
                  <Flag size={16} aria-hidden="true" />
                  {stage === 4 ? "Finish race" : "Force next stage"}
                </button>
              </>
            )}
            {status === GameState.SUMMARY && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetGame}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Reset race
              </button>
            )}
          </div>
        </section>

        <SpectatorView
          stage={stage}
          currentQuestionIndex={currentQuestionIndex}
          questionsPerStage={questionsPerStage}
          players={players}
          isPaused={status === GameState.PAUSED}
          showTimer={
            status === GameState.PLAYING || status === GameState.PAUSED
          }
          getTimeRemaining={getTimeRemaining}
          onExpire={handleExpire}
        />
      </section>
    </main>
  );
}

export default AdminPage;
