// src/pages/LiveRacePanel.tsx

import type { Player } from "../types/game";
import { GameState } from "../types/game";
import { useGameStore } from "../store/useGameStore";
import LiveRaceTrack from "../components/game/LiveRaceTracking";

interface LiveRacePanelProps {
  players: Player[];
  playerId: string;
}

function LiveRacePanel({ players, playerId }: LiveRacePanelProps) {
  const status = useGameStore((state) => state.status);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const questions = useGameStore((state) => state.questions);
  const pendingStage = useGameStore((state) => state.pendingStage);

  const totalQuestions = questions.length;

  let settledQuestions = 0;

  if (status === GameState.QUESTION_RESULT) {
    settledQuestions = currentQuestionIndex + 1;
  } else if (status === GameState.PLAYING || status === GameState.PAUSED) {
    settledQuestions = currentQuestionIndex;
  } else if (status === GameState.STAGE_TRANSITION) {
    settledQuestions =
      pendingStage === null ? totalQuestions : currentQuestionIndex;
  } else if (status === GameState.SUMMARY) {
    settledQuestions = totalQuestions;
  }

  const raceProgress =
    totalQuestions > 0
      ? Math.min(100, Math.max(0, (settledQuestions / totalQuestions) * 100))
      : 0;

  return (
    <LiveRaceTrack
      players={players}
      playerId={playerId}
      raceProgress={raceProgress}
    />
  );
}

export default LiveRacePanel;
