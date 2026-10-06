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
    raceProgress = 100;
  } else {
    let completedQuestions = currentQuestionIndex - stageStartIndex;

    if (status === GameState.QUESTION_RESULT) {
      completedQuestions += 1;
    }

    // Keep progress within the current stage.
    const stageProgress = Math.min(
      1,
      Math.max(0, completedQuestions / safeStageQuestionCount),
    );

    // Each stage occupies exactly one quarter of the race.
    // During a transition, stay at the end of the current stage.
    const stagePosition =
      status === GameState.STAGE_TRANSITION ? 1 : stageProgress;

    raceProgress = ((stage - 1 + stagePosition) / 4) * 100;
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
