// src/components/game/LiveRaceTracking.tsx

import { Focus, Minus, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CAR_OPTIONS } from "../../data/cars";
import type { Player } from "../../types/game";

type TrackView = "focus" | "overview";

interface LiveRaceTrackProps {
  players: Player[];
  playerId: string;
}

const VIEW_STORAGE_KEY = "hcm-quiz-racing-track-view";

function getSavedView(): TrackView {
  try {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return saved === "overview" ? "overview" : "focus";
  } catch {
    return "focus";
  }
}

function LiveRaceTrack({ players, playerId }: LiveRaceTrackProps) {
  const [view, setView] = useState<TrackView>(getSavedView);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // The track still works if browser storage is unavailable.
    }
  }, [view]);

  // Highest-scoring players appear first.
  const rankedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name),
      ),
    [players],
  );

  // Map scores to the road: lowest score near START, highest near FINISH.
  // Equal scores produce equal progress. Negative scores remain on the road.
  const progressByPlayer = useMemo(() => {
    const scores = players.map((player) => player.score);
    const minScore = Math.min(0, ...scores);
    const maxScore = Math.max(0, ...scores);
    const scoreRange = maxScore - minScore;

    return new Map(
      players.map((player) => {
        const progress =
          scoreRange === 0
            ? 8
            : 8 + ((player.score - minScore) / scoreRange) * 84;

        return [player.id, progress];
      }),
    );
  }, [players]);

  const visiblePlayers = useMemo(() => {
    if (view === "overview") return rankedPlayers;

    const playerIndex = rankedPlayers.findIndex(
      (player) => player.id === playerId,
    );

    if (playerIndex === -1) return rankedPlayers.slice(0, 3);

    // Keep the current player and nearby ranked competitors in focus view.
    const count = Math.min(3, rankedPlayers.length);
    const start = Math.max(
      0,
      Math.min(playerIndex - 1, rankedPlayers.length - count),
    );

    return rankedPlayers.slice(start, start + count);
  }, [rankedPlayers, playerId, view]);

  const trackHeight = 620 * zoom;

  return (
    <section className="live-race-panel" aria-label="Live race track">
      <header className="live-race-panel-header">
        <div>
          <p className="eyebrow">LIVE TRACK</p>
          <h2>Race view</h2>
          <p className="live-race-player-count">
            {players.length} {players.length === 1 ? "racer" : "racers"}
          </p>
        </div>

        <div className="live-race-view-controls">
          <button
            type="button"
            className={`live-race-icon-button ${
              view === "focus" ? "is-active" : ""
            }`}
            onClick={() => setView("focus")}
            aria-label="Focus on my car"
            aria-pressed={view === "focus"}
            title="Focus on me"
          >
            <Focus size={16} />
          </button>

          <button
            type="button"
            className={`live-race-icon-button ${
              view === "overview" ? "is-active" : ""
            }`}
            onClick={() => setView("overview")}
            aria-label="Show all racers"
            aria-pressed={view === "overview"}
            title="Overview"
          >
            <Users size={16} />
          </button>
        </div>
      </header>

      <div className="live-race-zoom-controls">
        <span>{view === "focus" ? "FOCUS VIEW" : "FIELD OVERVIEW"}</span>

        <div>
          <button
            type="button"
            className="live-race-icon-button"
            onClick={() => setZoom((current) => Math.max(0.75, current - 0.25))}
            disabled={zoom <= 0.75}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            className="live-race-icon-button"
            onClick={() => setZoom((current) => Math.min(1.5, current + 0.25))}
            disabled={zoom >= 1.5}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="live-race-viewport">
        <div
          className={`live-race-road ${
            view === "overview" ? "live-race-road-overview" : ""
          }`}
          style={{
            height: `${trackHeight}px`,
            gridTemplateColumns: `repeat(${Math.max(
              visiblePlayers.length,
              1,
            )}, minmax(0, 1fr))`,
          }}
        >
          <div className="live-race-finish" aria-label="Finish line">
            <span>FINISH</span>
            <div className="live-race-checkerboard" />
          </div>

          <div className="live-race-milestone milestone-one">
            <span>CHECKPOINT 02</span>
          </div>

          <div className="live-race-milestone milestone-two">
            <span>CHECKPOINT 01</span>
          </div>

          {visiblePlayers.map((racer) => {
            const rank = rankedPlayers.findIndex(
              (player) => player.id === racer.id,
            );
            const isMe = racer.id === playerId;
            const car = CAR_OPTIONS.find(
              (option) => option.id === racer.carSprite,
            );
            const progress = progressByPlayer.get(racer.id) ?? 8;

            return (
              <div
                className={`live-race-lane ${isMe ? "live-race-lane-me" : ""}`}
                key={racer.id}
              >
                <span className="live-race-lane-number">
                  {String(rank + 1).padStart(2, "0")}
                </span>

                <div
                  className={`live-race-car ${isMe ? "live-race-car-me" : ""}`}
                  style={{ top: `${100 - progress}%` }}
                  title={`${racer.name} — ${Math.round(progress)}% relative score position`}
                >
                  {car ? (
                    <img src={car.image} alt={car.name} />
                  ) : (
                    <span className="live-race-car-fallback">🏎️</span>
                  )}

                  {isMe && <span className="live-race-you-label">YOU</span>}

                  <span className="live-race-score-label">
                    {racer.score.toLocaleString()} pts
                  </span>
                </div>

                <span className="live-race-racer-label">{racer.name}</span>
              </div>
            );
          })}

          <div className="live-race-start">
            <div className="live-race-checkerboard" />
            <span>START</span>
          </div>
        </div>
      </div>

      <footer className="live-race-panel-footer">
        <span className="live-race-status-dot" />
        <span>Live standings · Sorted by score</span>
      </footer>
    </section>
  );
}

export default LiveRaceTrack;
