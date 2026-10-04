// src/pages/LiveRacePanel.tsx

import type { Player } from "../types/game";
import LiveRaceTrack from "../components/game/LiveRaceTracking";

interface LiveRacePanelProps {
  players: Player[];
  playerId: string;
}

function LiveRacePanel({ players, playerId }: LiveRacePanelProps) {
  return <LiveRaceTrack players={players} playerId={playerId} />;
}

export default LiveRacePanel;
