// src/pages/GamePage.tsx

import { useCallback, useMemo, useState } from "react";
import Timer from "../components/Timer";
import { useGameStore } from "../store/useGameStore";
import { GameState } from "../types/game";

const STAGE_NAMES: Record<number, string> = {
  1: "Easy Start",
  2: "City Challenge",
  3: "Hard Race",
  4: "Final Sprint",
};

interface AnswerFeedback {
  answerIndex: number;
  correct: boolean;
}

function GamePage() {
  const status = useGameStore((state) => state.status);
  const stage = useGameStore((state) => state.stage);
  const questions = useGameStore((state) => state.questions);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const players = useGameStore((state) => state.players);
  const getTimeRemaining = useGameStore((state) => state.getTimeRemaining);
  const submitAnswer = useGameStore((state) => state.submitAnswer);
  const continueStage = useGameStore((state) => state.continueStage);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const skipQuestion = useGameStore((state) => state.skipQuestion);

  const currentQuestion = questions[currentQuestionIndex];

  const player = players[0];

  const timerGetter = useCallback(() => getTimeRemaining(), [getTimeRemaining]);

  const handleExpire = useCallback(() => {
    if (status === GameState.PLAYING) {
      skipQuestion();
    }
  }, [skipQuestion, status]);

  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(
    null,
  );

  const progressText = useMemo(() => {
    if (!currentQuestion) {
      return "No question";
    }

    const stageStart = (stage - 1) * 2;
    const questionNumber = currentQuestionIndex - stageStart + 1;

    return `Question ${questionNumber} / 2`;
  }, [currentQuestion, currentQuestionIndex, stage]);

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

  const feedbackOverlay = answerFeedback && (
    <div className="answer-feedback-overlay">
      <div
        className={`answer-feedback-card ${
          answerFeedback.correct ? "feedback-correct" : "feedback-wrong"
        }`}
      >
        <div className="feedback-icon">
          {answerFeedback.correct ? "✓" : "✕"}
        </div>

        <strong>{answerFeedback.correct ? "CORRECT!" : "WRONG!"}</strong>
      </div>
    </div>
  );

  return (
    <main className="game-page">
      {feedbackOverlay}

      <section className="game-card">
        <header className="game-header">
          <div>
            <p className="eyebrow">Stage {stage}</p>
            <h1>{STAGE_NAMES[stage] ?? `Stage ${stage}`}</h1>
          </div>

          <Timer getTimeRemaining={timerGetter} onExpire={handleExpire} />
        </header>

        <div className="progress-row">
          <span>{progressText}</span>

          <span>
            Score: <strong>{player.score}</strong>
          </span>
        </div>

        <div className="question-card">
          <h2>{currentQuestion.question}</h2>

          <div className="answer-grid">
            {currentQuestion.options.map((option, index) => (
              <button
                key={`${currentQuestion.id}-${index}`}
                type="button"
                className={[
                  "answer-button",
                  answered ? "answer-disabled" : "",
                  answerFeedback?.answerIndex === index
                    ? answerFeedback.correct
                      ? "answer-correct"
                      : "answer-wrong"
                    : "",
                ].join(" ")}
                disabled={answered}
                onClick={() => {
                  const correct = index === currentQuestion.correctIndex;

                  setAnswerFeedback({
                    answerIndex: index,
                    correct,
                  });

                  submitAnswer(player.id, index);

                  window.setTimeout(() => {
                    setAnswerFeedback(null);
                  }, 700);
                }}
              >
                <span className="answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>

                <span>{option}</span>
              </button>
            ))}
          </div>

          {answered && (
            <p className="answered-message">
              Answer submitted. Waiting for the question to finish...
            </p>
          )}
        </div>

        <footer className="game-footer">
          <div className="player-racer">
            <span
              className="mini-car"
              style={{ backgroundColor: player.carColor }}
            >
              🏎️
            </span>

            <div>
              <strong>{player.name}</strong>
              <span>{player.correctAnswersCount} correct</span>
            </div>
          </div>

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
