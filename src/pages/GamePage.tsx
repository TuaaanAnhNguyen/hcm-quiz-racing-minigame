// src/pages/GamePage.tsx

import { useCallback, useMemo, useState } from "react";
import Timer from "../components/Timer";
import { useGameStore } from "../store/useGameStore";
import { GameState } from "../types/game";
import QuestionCard from "../components/game/QuestionCard";
import QuestionResult from "../components/game/QuestionResult";
import PlayerStatus from "../components/game/PlayerStatus";
import { Eye } from "lucide-react";
import SpectatorView from "../components/game/SpectatorView";
import { CAR_OPTIONS } from "../data/cars";

const STAGE_NAMES: Record<number, string> = {
  1: "Easy Start",
  2: "City Challenge",
  3: "Hard Race",
  4: "Final Sprint",
};

function GamePage() {
  const status = useGameStore((state) => state.status);
  const stage = useGameStore((state) => state.stage);
  const questions = useGameStore((state) => state.questions);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const players = useGameStore((state) => state.players);
  const answerHistory = useGameStore((state) => state.answerHistory);

  const getTimeRemaining = useGameStore((state) => state.getTimeRemaining);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const timeExpired = useGameStore((state) => state.timeExpired);
  const nextQuestion = useGameStore((state) => state.nextQuestion);
  const skipQuestion = useGameStore((state) => state.skipQuestion);
  const forceNextStage = useGameStore((state) => state.forceNextStage);
  const questionsPerStage = useGameStore((state) => state.questionsPerStage);

  const continueStage = useGameStore((state) => state.continueStage);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const pauseGame = useGameStore((state) => state.pauseGame);

  const currentQuestion = questions[currentQuestionIndex];
  const player = players[0];

  console.log("[GamePage] player:", player);
  console.log("[GamePage] player.carSprite:", player?.carSprite);

  const gameCar = player
    ? CAR_OPTIONS.find((car) => car.id === player.carSprite)
    : undefined;

  console.log("[GamePage] resolved car:", gameCar);
  console.log("[GamePage] resolved car image:", gameCar?.image);

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

  const handleExpire = useCallback(() => {
    if (status === GameState.PLAYING) {
      timeExpired();
    }
  }, [status, timeExpired]);

  const progressText = useMemo(() => {
    if (!currentQuestion) {
      return "No question";
    }

    const stageStart = (stage - 1) * 2;
    const questionNumber = currentQuestionIndex - stageStart + 1;

    return `Question ${questionNumber} / 2`;
  }, [currentQuestion, currentQuestionIndex, stage]);

  if (spectatorMode) {
    return (
      <SpectatorView
        stage={stage}
        currentQuestionIndex={currentQuestionIndex}
        questionsPerStage={questionsPerStage}
        players={players}
        isPaused={status === GameState.PAUSED}
        getTimeRemaining={getTimeRemaining}
        onExpire={handleExpire}
        onReturnToPlayerView={() => setSpectatorMode(false)}
        onPause={pauseGame}
        onResume={resumeGame}
        onSkipQuestion={skipQuestion}
        onForceNextStage={forceNextStage}
      />
    );
  }

  /*
   * Stage transition screen
   */
  if (status === GameState.STAGE_TRANSITION) {
    const isFinished = stage === 4 && currentQuestionIndex >= questions.length;

    return (
      <main className="transition-page">
        <section className="transition-card">
          <div className="transition-icon">{isFinished ? "🏁" : "🏎️"}</div>

          <p className="eyebrow">Stage {stage}</p>

          <h1>{isFinished ? "Race Complete!" : `Stage ${stage} Complete!`}</h1>

          <p>
            {isFinished
              ? "You have finished all four stages."
              : `Get ready for ${STAGE_NAMES[stage] ?? `Stage ${stage}`}.`}
          </p>

          {player && (
            <div className="transition-score">
              <span>Your score</span>
              <strong>{player.score}</strong>
            </div>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={continueStage}
          >
            {isFinished ? "View Results" : "Continue"}
          </button>
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
          <h1>Waiting for game...</h1>
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
              <p className="eyebrow">Stage {stage}</p>
              <h1>{STAGE_NAMES[stage] ?? `Stage ${stage}`}</h1>
            </div>
          </header>

          <div className="progress-row">
            <span>{progressText}</span>

            <span>
              Score: <strong>{player.score}</strong>
            </span>
          </div>

          <QuestionResult
            question={currentQuestion}
            selectedIndex={currentAnswer?.selectedIndex ?? null}
            correct={currentAnswer?.correct ?? false}
            scoreEarned={currentAnswer?.scoreEarned ?? 0}
            onNext={nextQuestion}
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
            <p className="eyebrow">Stage {stage}</p>
            <h1>{STAGE_NAMES[stage] ?? `Stage ${stage}`}</h1>
          </div>

          <div className="game-header-controls">
            <Timer getTimeRemaining={timerGetter} onExpire={handleExpire} />

            <button
              type="button"
              className="secondary-button spectator-open"
              onClick={() => setSpectatorMode(true)}
            >
              <Eye size={16} aria-hidden="true" />
              Live race
            </button>
          </div>
        </header>

        <div className="progress-row">
          <span>{progressText}</span>

          <span>
            Score: <strong>{player.score}</strong>
          </span>
        </div>

        <QuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          answered={answered}
          selectedIndex={currentAnswer?.selectedIndex ?? null}
          feedbackVisible={false}
          feedbackCorrect={false}
          onAnswer={(index) => {
            if (!answered && status === GameState.PLAYING) {
              submitAnswer(player.id, index);
            }
          }}
        />

        <footer className="game-footer">
          <PlayerStatus player={player} />

          {status === GameState.PLAYING ? (
            <button
              type="button"
              className="secondary-button"
              onClick={pauseGame}
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="secondary-button"
              onClick={resumeGame}
            >
              Resume
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

export default GamePage;
