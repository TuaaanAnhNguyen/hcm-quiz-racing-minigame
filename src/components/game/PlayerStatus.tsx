// src/components/game/PlayerStatus.tsx

import { CAR_OPTIONS } from "../../data/cars";
import type { Player } from "../../types/game";

interface PlayerStatusProps {
  player: Player;
}

function PlayerStatus({ player }: PlayerStatusProps) {
  const car = CAR_OPTIONS.find(
    (candidate) => candidate.id === player.carSprite,
  );

  console.log("[PlayerStatus] player.carSprite:", player.carSprite);
  console.log("[PlayerStatus] resolved car:", car);
  console.log("[PlayerStatus] resolved image:", car?.image);

  return (
    <div className="player-racer">
      <span className="mini-car">
        {car && <img src={car.image} alt={car.name} />}
      </span>

      <div>
        <strong>{player.name}</strong>
        <span>{player.correctAnswersCount} correct</span>
      </div>
    </div>
  );
}

export default PlayerStatus;
