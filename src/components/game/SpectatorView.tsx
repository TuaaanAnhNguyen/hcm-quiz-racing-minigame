import {
  ArrowLeft,
  Flag,
  Pause,
  Play,
  SkipForward,
  Trophy,
  Users,
} from "lucide-react";
import type { Player, StageNumber } from "../../types/game";
import Timer from "../Timer";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Warm-up",
  2: "Acceleration",
  3: "Challenge",
  4: "Final sprint",
};

const TRACK_NAMES: Record<StageNumber, string> = {
  1: "OVAL CIRCUIT",
  2: "DRAG STRIP",
  3: "HAIRPIN CIRCUIT",
  4: "GRAND PRIX FINISH",
};

interface SpectatorViewProps {
  stage: StageNumber;
  currentQuestionIndex: number;
  questionsPerStage: number;
  players: Player[];
  isPaused: boolean;
  getTimeRemaining: () => number;
  onExpire: () => void;
  onReturnToPlayerView: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkipQuestion: () => void;
  onForceNextStage: () => void;
}

function SpectatorView({
  stage,
  currentQuestionIndex,
  questionsPerStage,
  players,
  isPaused,
  getTimeRemaining,
  onExpire,
  onReturnToPlayerView,
  onPause,
  onResume,
  onSkipQuestion,
  onForceNextStage,
}: SpectatorViewProps) {
  const standings = [...players].sort(
    (first, second) =>
      second.score - first.score ||
      second.correctAnswersCount - first.correctAnswersCount ||
      first.name.localeCompare(second.name),
  );
  const lowestScore = standings.at(-1)?.score ?? 0;
  const highestScore = standings[0]?.score ?? 0;
  const stageQuestion = ((currentQuestionIndex % questionsPerStage) + 1);

  return (
    <main className="game-page spectator-page">
      <section className="game-card spectator-card">
        <header className="spectator-header">
          <div>
            <p className="eyebrow">LIVE RACE · SPECTATOR</p>
            <h1>Stage {stage}: {STAGE_NAMES[stage]}</h1>
            <p className="spectator-subtitle">
              Question {stageQuestion} of {questionsPerStage} · {standings.length} {standings.length === 1 ? "team" : "teams"} racing
            </p>
          </div>
          <div className="spectator-header-actions">
            <Timer getTimeRemaining={getTimeRemaining} onExpire={onExpire} />
            <button
              type="button"
              className="secondary-button spectator-return"
              onClick={onReturnToPlayerView}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Player view
            </button>
          </div>
        </header>

        <section className="host-controls" aria-label="Host controls">
          <div>
            <p className="eyebrow">RACE CONTROL</p>
            <strong>{isPaused ? "Race paused" : "Race in progress"}</strong>
          </div>
          <div className="host-control-actions">
            {isPaused ? (
              <button type="button" className="primary-button" onClick={onResume}>
                <Play size={16} aria-hidden="true" /> Resume
              </button>
            ) : (
              <button type="button" className="secondary-button" onClick={onPause}>
                <Pause size={16} aria-hidden="true" /> Pause
              </button>
            )}
            <button type="button" className="secondary-button" onClick={onSkipQuestion}>
              <SkipForward size={16} aria-hidden="true" /> Skip question
            </button>
            <button type="button" className="primary-button host-force-button" onClick={onForceNextStage}>
              <Flag size={16} aria-hidden="true" />
              {stage === 4 ? "Finish race" : "Force next stage"}
            </button>
          </div>
        </section>

        <section className="spectator-content" aria-label="Live leaderboard">
          <div className="spectator-section-heading">
            <div>
              <p className="eyebrow">TRACK VIEW</p>
              <h2>{TRACK_NAMES[stage]}</h2>
            </div>
            <span className={`track-stage-mark track-stage-mark-${stage}`}>
              STAGE 0{stage}
            </span>
          </div>

          <div className={`spectator-track spectator-track-${stage}`}>
            {standings.length === 0 ? (
              <div className="spectator-empty">
                <Users size={24} aria-hidden="true" />
                <strong>No racers registered</strong>
              </div>
            ) : (
              standings.map((player, index) => {
                const scoreRange = highestScore - lowestScore;
                const progress = scoreRange === 0
                  ? 18
                  : 12 + ((player.score - lowestScore) / scoreRange) * 72;

                return (
                  <div className="track-lane" key={player.id}>
                    <span className="track-rank">{String(index + 1).padStart(2, "0")}</span>
                    <div className="track-lane-body">
                      <div className="track-lane-line" />
                      <span
                        className="track-car"
                        style={{ left: `${progress}%`, backgroundColor: player.carColor }}
                        title={`${player.name}: ${player.score} points`}
                      >
                        🏎️
                      </span>
                      <span className="track-finish-line" aria-hidden="true" />
                    </div>
                    <span className="track-points">{player.score.toLocaleString()} pts</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="spectator-section-heading leaderboard-heading">
            <div>
              <p className="eyebrow">LIVE STANDINGS</p>
              <h2>Leaderboard</h2>
            </div>
            <span className="leaderboard-count">
              <Trophy size={15} aria-hidden="true" /> {standings.length} racers
            </span>
          </div>

          {standings.length > 0 ? (
            <ol className="spectator-leaderboard">
              {standings.map((player, index) => (
                <li className="spectator-player-row" key={player.id}>
                  <span className={`spectator-position ${index < 3 ? "podium-position" : ""}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="spectator-player-car" style={{ backgroundColor: player.carColor }}>
                    🏎️
                  </span>
                  <span className="spectator-player-name">
                    <strong>{player.name}</strong>
                    <span>{player.correctAnswersCount} correct · {player.hasAnswered ? "Answered" : "Racing"}</span>
                  </span>
                  <strong className="spectator-player-score">{player.score.toLocaleString()}</strong>
                  <span className="spectator-score-label">PTS</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="spectator-empty-copy">Players will appear here when they join the race.</p>
          )}
        </section>
      </section>
    </main>
  );
}

export default SpectatorView;
