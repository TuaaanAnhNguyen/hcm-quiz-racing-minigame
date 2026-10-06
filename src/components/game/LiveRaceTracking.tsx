// src/components/game/LiveRaceTracking.tsx

import { Focus, Minus, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CAR_OPTIONS } from "../../data/cars";
import type { Player } from "../../types/game";

type TrackView = "focus" | "overview";

interface LiveRaceTrackProps {
  players: Player[];
  playerId: string;
  raceProgress: number;
}

const VIEW_STORAGE_KEY = "hcm-quiz-racing-track-view";

function getSavedView(): TrackView {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "overview"
      ? "overview"
      : "focus";
  } catch {
    return "focus";
  }
}

function LiveRaceTrack({
  players,
  playerId,
  raceProgress,
}: LiveRaceTrackProps) {
  const [view, setView] = useState<TrackView>(getSavedView);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // Keep the track usable if browser storage is unavailable.
    }
  }, [view]);

  const rankedPlayers = useMemo(
    () =>
      [...players].sort(
        (a, b) => b.score - a.score || a.name.localeCompare(b.name),
      ),
    [players],
  );

  // The question/stage controls the overall race position.
  // Scores only move players a little forward or backward around that position.

  const progressByPlayer = useMemo(() => {
    const overallProgress = Math.min(100, Math.max(0, raceProgress));

    const scores = players.map((player) => player.score);
    const minScore = Math.min(0, ...scores);
    const maxScore = Math.max(0, ...scores);
    const scoreRange = maxScore - minScore;

    // Use most of the track, leaving room for the finish banner.
    const normalizedProgress = overallProgress / 100;
    const easedProgress = Math.pow(normalizedProgress, 1.4);

    const baseProgress =
      overallProgress >= 100 ? 97.5 : 6 + easedProgress * 91.5;

    return new Map(
      players.map((player) => {
        const scorePosition =
          scoreRange === 0 ? 0.5 : (player.score - minScore) / scoreRange;

        // Scores affect relative placement, but not overall race progress.
        const scoreOffset =
          overallProgress >= 100
            ? (scorePosition - 0.5) * 1
            : (scorePosition - 0.5) * 1.5;

        const progress = Math.min(98, Math.max(3, baseProgress + scoreOffset));

        return [player.id, progress];
      }),
    );
  }, [players, raceProgress]);

  const visiblePlayers = useMemo(() => {
    if (view === "overview") return rankedPlayers;

    const playerIndex = rankedPlayers.findIndex(
      (player) => player.id === playerId,
    );

    if (playerIndex === -1) return rankedPlayers.slice(0, 3);

    const count = Math.min(3, rankedPlayers.length);
    const start = Math.max(
      0,
      Math.min(playerIndex - 1, rankedPlayers.length - count),
    );

    return rankedPlayers.slice(start, start + count);
  }, [rankedPlayers, playerId, view]);

  const trackHeight = 620 * zoom;

  return (
    <section className="live-race-panel" aria-label="Đường đua trực tiếp">
      <header className="live-race-panel-header">
        <div>
          <p className="eyebrow">ĐƯỜNG ĐUA TRỰC TIẾP</p>
          <h2>Đường đua</h2>
          <p className="live-race-player-count">
            {players.length} {players.length === 1 ? "tay đua" : "tay đua"}
          </p>
        </div>

        <div className="live-race-view-controls">
          <button
            type="button"
            className={`live-race-icon-button ${
              view === "focus" ? "is-active" : ""
            }`}
            onClick={() => setView("focus")}
            aria-label="Tập trung vào xe của tôi"
            aria-pressed={view === "focus"}
            title="Tập trung vào tôi"
          >
            <Focus size={16} />
          </button>

          <button
            type="button"
            className={`live-race-icon-button ${
              view === "overview" ? "is-active" : ""
            }`}
            onClick={() => setView("overview")}
            aria-label="Hiển thị tất cả tay đua"
            aria-pressed={view === "overview"}
            title="Xem toàn bộ đường đua"
          >
            <Users size={16} />
          </button>
        </div>
      </header>

      <div className="live-race-zoom-controls">
        <span>{view === "focus" ? "THEO DÕI CỦA TÔI" : "TOÀN BỘ TAY ĐUA"}</span>

        <div>
          <button
            type="button"
            className="live-race-icon-button"
            onClick={() => setZoom((current) => Math.max(0.75, current - 0.25))}
            disabled={zoom <= 0.75}
            aria-label="Thu nhỏ đường đua"
            title="Thu nhỏ"
          >
            <Minus size={14} />
          </button>

          <button
            type="button"
            className="live-race-icon-button"
            onClick={() => setZoom((current) => Math.min(1.5, current + 0.25))}
            disabled={zoom >= 1.5}
            aria-label="Phóng to đường đua"
            title="Phóng to"
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
          <div className="live-race-finish" aria-label="Vạch đích">
            <span>VỀ ĐÍCH</span>
            <div className="live-race-checkerboard" />
          </div>

          <div
            className="live-race-stage-divider stage-divider-one"
            aria-hidden="true"
          />
          <div
            className="live-race-stage-divider stage-divider-two"
            aria-hidden="true"
          />
          <div
            className="live-race-stage-divider stage-divider-three"
            aria-hidden="true"
          />

          {visiblePlayers.map((racer) => {
            const rank = rankedPlayers.findIndex(
              (player) => player.id === racer.id,
            );
            const isMe = racer.id === playerId;
            const car = CAR_OPTIONS.find(
              (option) => option.id === racer.carSprite,
            );
            const progress = progressByPlayer.get(racer.id) ?? 3;

            return (
              <div
                className={`live-race-lane ${isMe ? "live-race-lane-me" : ""}`}
                key={racer.id}
              >
                <span className="live-race-lane-number">HẠNG {rank + 1}</span>

                <div
                  className={`live-race-car ${isMe ? "live-race-car-me" : ""}`}
                  style={{
                    top: `${100 - progress}%`,
                  }}
                  title={`${racer.name} — vị trí theo tiến độ cuộc đua`}
                >
                  {car ? (
                    <img src={car.image} alt={car.name} />
                  ) : (
                    <span className="live-race-car-fallback">🏎️</span>
                  )}

                  {isMe && <span className="live-race-you-label">BẠN</span>}

                  <span className="live-race-score-label">
                    {racer.score.toLocaleString("vi-VN")} điểm
                  </span>
                </div>

                <span className="live-race-racer-label">{racer.name}</span>
              </div>
            );
          })}

          <div className="live-race-start">
            <div className="live-race-checkerboard" />
            <span>XUẤT PHÁT</span>
          </div>
        </div>
      </div>

      <footer className="live-race-panel-footer">
        <span className="live-race-status-dot" />
        <span>Thứ hạng cập nhật theo điểm số</span>
      </footer>
    </section>
  );
}

export default LiveRaceTrack;
