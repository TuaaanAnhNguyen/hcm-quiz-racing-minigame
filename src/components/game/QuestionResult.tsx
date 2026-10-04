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
          ? "HẾT GIỜ"
          : correct
            ? "CHÍNH XÁC!"
            : "CHƯA CHÍNH XÁC"}
      </div>

      {selectedIndex !== null && (
        <p>
          Bạn đã chọn: <strong>{question.options[selectedIndex]}</strong>
        </p>
      )}

      <p>
        Đáp án đúng:{" "}
        <strong>{question.options[question.correctIndex]}</strong>
      </p>

      <div className="result-score">
        {scoreEarned >= 0 ? "+" : ""}
        {scoreEarned}
      </div>

      {question.explanation && (
        <div className="result-explanation">
          <strong>Giải thích</strong>
          <p>{question.explanation}</p>
        </div>
      )}

      {onNext && (
        <button type="button" onClick={onNext}>
          CÂU TIẾP THEO →
        </button>
      )}
    </div>
  );
}

export default QuestionResult;
