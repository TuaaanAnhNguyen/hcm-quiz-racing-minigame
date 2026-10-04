// src/components/game/LiveRaceTracking.tsx

import { Focus, Minus, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { CAR_OPTIONS } from "../../data/cars";
import type { Player } from "../../types/game";

type TrackView = "focus" | "overview";

interface LiveRaceTrackProps {
  players: Player[];
  playerId: string;
}

const DEMO_PROGRESS = [24, 37, 45, 53, 62, 70, 79, 87];

function LiveRaceTrack({ players, playerId }: LiveRaceTrackProps) {
  const [view, setView] = useState<TrackView>("focus");
  const [zoom, setZoom] = useState(1);

  const visiblePlayers = useMemo(() => {
    if (view === "overview") {
      return players;
    }

    const playerIndex = players.findIndex((player) => player.id === playerId);

    if (playerIndex === -1) {
      return players.slice(0, 3);
    }

    // Visual preview only: show the current player and nearby list entries.
    const start = Math.max(0, Math.min(playerIndex - 1, players.length - 3));

    return players.slice(start, start + 3);
  }, [players, playerId, view]);

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
            const originalIndex = players.findIndex(
              (player) => player.id === racer.id,
            );

            const progress =
              DEMO_PROGRESS[Math.max(0, originalIndex) % DEMO_PROGRESS.length];

            const isMe = racer.id === playerId;

            const car = CAR_OPTIONS.find(
              (option) => option.id === racer.carSprite,
            );

            return (
              <div
                className={`live-race-lane ${isMe ? "live-race-lane-me" : ""}`}
                key={racer.id}
              >
                <span className="live-race-lane-number">
                  {String(originalIndex + 1).padStart(2, "0")}
                </span>

                <div
                  className={`live-race-car ${isMe ? "live-race-car-me" : ""}`}
                  style={{ top: `${100 - progress}%` }}
                  title={`${racer.name} — demo position`}
                >
                  {car ? (
                    <img src={car.image} alt={car.name} />
                  ) : (
                    <span className="live-race-car-fallback">🏎️</span>
                  )}

                  {isMe && <span className="live-race-you-label">YOU</span>}
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
        <span>Track preview · Positions are placeholders</span>
      </footer>
    </section>
  );
}

export default LiveRaceTrack;
