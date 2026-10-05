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
  const stage = useGameStore((state) => state.stage);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const questionsPerStage = useGameStore((state) => state.questionsPerStage);
  const pendingStage = useGameStore((state) => state.pendingStage);

  const safeQuestionsPerStage = Math.max(questionsPerStage, 1);

  let completedQuestions = currentQuestionIndex;

  if (status === GameState.QUESTION_RESULT) {
    completedQuestions += 1;
  }

  let raceProgress =
    (stage - 1 + completedQuestions / safeQuestionsPerStage) / 4;

  if (status === GameState.STAGE_TRANSITION) {
    raceProgress = pendingStage === null ? 1 : Math.min(1, stage / 4);
  }

  raceProgress = Math.min(1, Math.max(0, raceProgress)) * 100;

  return (
    <LiveRaceTrack
      players={players}
      playerId={playerId}
      raceProgress={raceProgress}
    />
  );
}

export default LiveRacePanel;
