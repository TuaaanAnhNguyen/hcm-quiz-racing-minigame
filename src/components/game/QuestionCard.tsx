// src/components/game/QuestionCard.tsx

import AnswerButton from "./AnswerButton";

interface QuestionCardProps {
  question: string;
  options: string[];
  answered: boolean;
  selectedIndex: number | null;
  onAnswer: (index: number) => void;
}

function QuestionCard({
  question,
  options,
  answered,
  selectedIndex,
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

      {answered && <p className="answered-message">Đã gửi câu trả lời.</p>}
    </div>
  );
}

export default QuestionCard;
