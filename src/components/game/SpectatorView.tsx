// src/components/game/SpectatorView.tsx

import { ArrowLeft, Trophy, Users } from "lucide-react";
import type { Player, StageNumber } from "../../types/game";
import Timer from "../Timer";
import { CAR_OPTIONS } from "../../data/cars";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Warm-up",
  2: "Acceleration",
  3: "Challenge",
  4: "Final Sprint",
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
  showTimer: boolean;
  getTimeRemaining: () => number;
  onExpire: () => void;
  onReturnToPlayerView?: () => void;
}

function SpectatorView({
  stage,
  currentQuestionIndex,
  questionsPerStage,
  players,
  isPaused,
  showTimer,
  getTimeRemaining,
  onExpire,
  onReturnToPlayerView,
}: SpectatorViewProps) {
  const standings = [...players].sort(
    (first, second) =>
      second.score - first.score ||
      second.correctAnswersCount - first.correctAnswersCount ||
      first.name.localeCompare(second.name),
  );

  const lowestScore = standings.at(-1)?.score ?? 0;
  const highestScore = standings[0]?.score ?? 0;

  const stageQuestion = (currentQuestionIndex % questionsPerStage) + 1;

  return (
    <>
        <header className="spectator-header">
          <div>
            <p className="eyebrow">
              LIVE RACE · {isPaused ? "PAUSED" : "TRACK"}
            </p>

            <h1>
              Stage {stage}: {STAGE_NAMES[stage]}
            </h1>

            <p className="spectator-subtitle">
              Question {stageQuestion} of {questionsPerStage} ·{" "}
              {standings.length} {standings.length === 1 ? "racer" : "racers"}{" "}
              racing
            </p>
          </div>

          <div className="spectator-header-actions">
            {showTimer && (
              <Timer getTimeRemaining={getTimeRemaining} onExpire={onExpire} />
            )}

            {onReturnToPlayerView && (
              <button
                type="button"
                className="secondary-button spectator-return"
                onClick={onReturnToPlayerView}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Player view
              </button>
            )}
          </div>
        </header>

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
                const car = CAR_OPTIONS.find(
                  (candidate) => candidate.id === player.carSprite,
                );

                const scoreRange = highestScore - lowestScore;

                const progress =
                  scoreRange === 0
                    ? 18
                    : 12 + ((player.score - lowestScore) / scoreRange) * 72;

                return (
                  <div className="track-lane" key={player.id}>
                    <span className="track-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="track-lane-body">
                      <div className="track-lane-line" />

                      <span
                        className="track-car"
                        style={{ left: `${progress}%` }}
                        title={`${player.name}: ${player.score} points`}
                      >
                        {car && <img src={car.image} alt={car.name} />}
                      </span>

                      <span className="track-finish-line" aria-hidden="true" />
                    </div>

                    <span className="track-points">
                      {player.score.toLocaleString()} pts
                    </span>
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
              <Trophy size={15} aria-hidden="true" />
              {standings.length} racers
            </span>
          </div>

          {standings.length > 0 ? (
            <ol className="spectator-leaderboard">
              {standings.map((player, index) => (
                <li className="spectator-player-row" key={player.id}>
                  <span
                    className={`spectator-position ${
                      index < 3 ? "podium-position" : ""
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="spectator-player-car">
                    <img
                      src={CAR_OPTIONS.find((car) => car.id === player.carSprite)?.image}
                      alt=""
                    />
                  </span>

                  <span className="spectator-player-name">
                    <strong>{player.name}</strong>

                    <span>
                      {player.correctAnswersCount} correct ·{" "}
                      {player.hasAnswered ? "Answered" : "Racing"}
                    </span>
                  </span>

                  <strong className="spectator-player-score">
                    {player.score.toLocaleString()}
                  </strong>

                  <span className="spectator-score-label">PTS</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="spectator-empty-copy">
              Players will appear here when they join the race.
            </p>
          )}
        </section>
    </>
  );
}

export default SpectatorView;
