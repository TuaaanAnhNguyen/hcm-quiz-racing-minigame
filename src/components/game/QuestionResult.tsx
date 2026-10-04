// src/components/game/QuestionResult.tsx

import type { Question } from "../../types/game";

interface QuestionResultProps {
  question: Question;
  selectedIndex: number | null;
  correct: boolean;
  scoreEarned: number;
  onNext?: () => void;
}

function QuestionResult({
  question,
  selectedIndex,
  correct,
  scoreEarned,
  onNext,
}: QuestionResultProps) {
  return (
    <div className="question-result">
      <div className={correct ? "result-correct" : "result-wrong"}>
        {selectedIndex === null
          ? "TIME'S UP"
          : correct
            ? "CORRECT!"
            : "INCORRECT"}
      </div>

      {selectedIndex !== null && (
        <p>
          Your answer: <strong>{question.options[selectedIndex]}</strong>
        </p>
      )}

      <p>
        Correct answer:{" "}
        <strong>{question.options[question.correctIndex]}</strong>
      </p>

      <div className="result-score">
        {scoreEarned >= 0 ? "+" : ""}
        {scoreEarned}
      </div>

      {question.explanation && (
        <div className="result-explanation">
          <strong>Explanation</strong>
          <p>{question.explanation}</p>
        </div>
      )}

      {onNext && (
        <button type="button" onClick={onNext}>
          NEXT QUESTION →
        </button>
      )}
    </div>
  );
}

export default QuestionResult;
