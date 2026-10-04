// src/pages/GamePage.tsx

import { useCallback, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import Timer from "../components/Timer";
import SpectatorView from "../components/game/SpectatorView";
import { useGameStore } from "../store/useGameStore";
import { GameState } from "../types/game";
import QuestionCard from "../components/game/QuestionCard";
import QuestionResult from "../components/game/QuestionResult";
import PlayerStatus from "../components/game/PlayerStatus";
import { getRoomRoute } from "../lib/roomRouting";

const STAGE_NAMES: Record<number, string> = {
  1: "Khởi động",
  2: "Tăng tốc",
  3: "Thử thách",
  4: "Về đích",
};

function GamePage() {
  const status = useGameStore((state) => state.status);
  const stage = useGameStore((state) => state.stage);
  const questions = useGameStore((state) => state.questions);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const questionsPerStage = useGameStore((state) => state.questionsPerStage);
  const pendingStage = useGameStore((state) => state.pendingStage);
  const players = useGameStore((state) => state.players);
  const answerHistory = useGameStore((state) => state.answerHistory);

  const getTimeRemaining = useGameStore((state) => state.getTimeRemaining);
  const submitAnswer = useGameStore((state) => state.submitAnswer);

  const roomCode = getRoomRoute().roomCode;

  const [playerId] = useState(() =>
    roomCode
      ? window.localStorage.getItem(`hcm-quiz-racing-player-${roomCode}`)
      : null,
  );

  const currentQuestion = questions[currentQuestionIndex];
  const player = players.find((candidate) => candidate.id === playerId);

  const [spectatorMode, setSpectatorMode] = useState(false);

  const currentAnswer =
    player && currentQuestion
      ? answerHistory.find(
          (answer) =>
            answer.playerId === player.id &&
            answer.questionId === currentQuestion.id,
        )
      : undefined;

  const timerGetter = useCallback(() => getTimeRemaining(), [getTimeRemaining]);

  const handleExpire = useCallback(() => {}, []);

  const progressText = useMemo(() => {
    if (!currentQuestion) {
      return "Chưa có câu hỏi";
    }

    const stageStart = (stage - 1) * 2;
    const questionNumber = currentQuestionIndex - stageStart + 1;

    return `Câu ${questionNumber} / 2`;
  }, [currentQuestion, currentQuestionIndex, stage]);

  if (spectatorMode) {
    return (
      <main className="game-page spectator-page">
        <section className="game-card spectator-card">
          <SpectatorView
            stage={stage}
            currentQuestionIndex={currentQuestionIndex}
            questionsPerStage={questionsPerStage}
            players={players}
            isPaused={status === GameState.PAUSED}
            showTimer={
              status === GameState.PLAYING || status === GameState.PAUSED
            }
            getTimeRemaining={getTimeRemaining}
            onExpire={handleExpire}
            onReturnToPlayerView={() => setSpectatorMode(false)}
          />
        </section>
      </main>
    );
  }

  /*
   * Stage transition screen
   */
  if (status === GameState.STAGE_TRANSITION) {
    const isFinished = stage === 4 && pendingStage === null;

    return (
      <main className="transition-page">
        <section className="transition-card">
          <div className="transition-icon">{isFinished ? "🏁" : "🏎️"}</div>

          <p className="eyebrow">Chặng {stage}</p>

          <h1>{isFinished ? "Cuộc đua kết thúc!" : `Hoàn thành chặng ${stage}!`}</h1>

          <p>
            {isFinished
              ? "Bạn đã hoàn thành cả bốn chặng đua."
              : `Hãy sẵn sàng cho chặng ${STAGE_NAMES[stage] ?? stage}.`}
          </p>

          {player && (
            <div className="transition-score">
              <span>Điểm của bạn</span>
              <strong>{player.score}</strong>
            </div>
          )}

          <p>Đang chờ quản trò tiếp tục cuộc đua.</p>
        </section>
      </main>
    );
  }

  /*
   * No current question/player yet
   */
  if (!currentQuestion || !player) {
    return (
      <main className="transition-page">
        <section className="game-card">
          <h1>Đang chờ cuộc đua bắt đầu...</h1>
        </section>
      </main>
    );
  }

  const answered = player.hasAnswered;

  /*
   * Result screen
   *
   * The question stays on screen, but the timer is gone because
   * the reducer changes status from PLAYING to QUESTION_RESULT.
   */
  if (status === GameState.QUESTION_RESULT) {
    return (
      <main className="game-page">
        <section className="game-card">
          <header className="game-header">
            <div>
              <p className="eyebrow">Chặng {stage}</p>
              <h1>{STAGE_NAMES[stage] ?? `Chặng ${stage}`}</h1>
            </div>
          </header>

          <div className="progress-row">
            <span>{progressText}</span>

            <span>Điểm: <strong>{player.score}</strong></span>
          </div>

          <QuestionResult
            question={currentQuestion}
            selectedIndex={currentAnswer?.selectedIndex ?? null}
            correct={currentAnswer?.correct ?? false}
            scoreEarned={currentAnswer?.scoreEarned ?? 0}
          />

          <footer className="game-footer">
            <PlayerStatus player={player} />
          </footer>
        </section>
      </main>
    );
  }

  /*
   * Normal playing / paused screen
   */
  return (
    <main className="game-page">
      <section className="game-card">
        <header className="game-header">
          <div>
            <p className="eyebrow">Chặng {stage}</p>
            <h1>{STAGE_NAMES[stage] ?? `Chặng ${stage}`}</h1>
          </div>

          <div className="game-header-controls">
            <Timer getTimeRemaining={timerGetter} onExpire={handleExpire} />

            <button
              type="button"
              className="secondary-button spectator-open"
              onClick={() => setSpectatorMode(true)}
            >
              <Eye size={16} aria-hidden="true" />
              Bảng đua trực tiếp
            </button>
          </div>
        </header>

        <div className="progress-row">
          <span>{progressText}</span>

          <span>Điểm: <strong>{player.score}</strong></span>
        </div>

        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          answered={answered}
          selectedIndex={currentAnswer?.selectedIndex ?? null}
          onAnswer={(index) => {
            if (!answered && status === GameState.PLAYING) {
              submitAnswer(player.id, index);
            }
          }}
        />

        <footer className="game-footer">
          <PlayerStatus player={player} />

          {status === GameState.PAUSED && (
            <span>Quản trò đã tạm dừng cuộc đua</span>
          )}
        </footer>
      </section>
    </main>
  );
}

export default GamePage;
