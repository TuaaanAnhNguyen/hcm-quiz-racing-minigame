// src/pages/LiveRacePanel.tsx

import type { Player } from "../types/game";
import { GameState } from "../types/game";
import { useGameStore } from "../store/useGameStore";
import LiveRaceTrack from "../components/game/LiveRaceTracking";
import { getStageStartIndex } from "../game/stages";

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
  const stageQuestionCounts = useGameStore(
    (state) => state.stageQuestionCounts,
  );
  const pendingStage = useGameStore((state) => state.pendingStage);
  const safeStageQuestionCount = Math.max(stageQuestionCounts[stage], 1);
  const stageStartIndex = getStageStartIndex(stage, stageQuestionCounts);

  let raceProgress: number;

  if (
    status === GameState.SUMMARY ||
    (status === GameState.STAGE_TRANSITION && pendingStage === null)
  ) {
    // The race is finished.
    raceProgress = 100;
  } else if (status === GameState.STAGE_TRANSITION) {
    // Move to the end of the current stage.
    raceProgress = (stage / 4) * 100;
  } else {
    let completedQuestions = currentQuestionIndex - stageStartIndex;

    if (status === GameState.QUESTION_RESULT) {
      completedQuestions += 1;
    }

    const stageProgress = Math.min(
      1,
      Math.max(0, completedQuestions / safeStageQuestionCount),
    );

    raceProgress = ((stage - 1 + stageProgress) / 4) * 100;
  }

  return (
    <LiveRaceTrack
      players={players}
      playerId={playerId}
      raceProgress={raceProgress}
    />
  );
}

export default LiveRacePanel;
