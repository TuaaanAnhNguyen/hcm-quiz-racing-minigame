// src/components/summary/Podium.tsx

import { CAR_OPTIONS } from "../../data/cars";
import type { Player } from "../../types/game";

interface PodiumProps {
  players: Player[];
}

function Podium({ players }: PodiumProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (sortedPlayers.length === 0) {
    return (
      <div className="podium-empty">
        <p>Chưa có kết quả để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="podium-list">
      {sortedPlayers.map((player, index) => {
        const car = CAR_OPTIONS.find(
          (option) => option.id === player.carSprite,
        );

        return (
          <div className="result-row" key={player.id}>
            <div className="result-position">#{index + 1}</div>

            <div className="mini-car">
              {car ? (
                <img
                  src={car.image}
                  alt={car.name}
                  className="summary-car-image"
                />
              ) : (
                <span aria-label="Racing car">🏎️</span>
              )}
            </div>

            <div className="result-player">
              <strong>{player.name}</strong>
              <span>{player.correctAnswersCount} câu trả lời đúng</span>
            </div>

            <strong className="result-score">
              {player.score.toLocaleString()}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

export default Podium;
