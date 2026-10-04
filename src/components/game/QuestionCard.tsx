// src/components/game/QuestionCard.tsx

import AnswerButton from "./AnswerButton";

interface QuestionCardProps {
  question: string;
  options: string[];
  answered: boolean;
  selectedIndex: number | null;
  feedbackVisible: boolean;
  feedbackCorrect: boolean;
  onAnswer: (index: number) => void;
}

function QuestionCard({
  question,
  options,
  answered,
  selectedIndex,
  feedbackVisible,
  feedbackCorrect,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div className="question-card">
      <h2>{question}</h2>

      <div className="answer-grid">
        {options.map((option, index) => (
          <AnswerButton
            key={`${question}-${index}`}
            option={option}
            index={index}
            disabled={answered}
            selected={selectedIndex === index}
            onClick={() => onAnswer(index)}
          />
        ))}
      </div>

      {answered && <p className="answered-message">Answer submitted.</p>}
    </div>
  );
}

export default QuestionCard;
