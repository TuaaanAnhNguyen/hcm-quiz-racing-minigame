// src/components/game/AnswerButton.tsx
interface AnswerButtonProps {
  option: string;
  index: number;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;
}

function AnswerButton({
  option,
  index,
  disabled,
  selected,
  onClick,
}: AnswerButtonProps) {
  return (
    <button
      type="button"
      className={`answer-button ${
        disabled ? "answer-disabled" : ""
      } ${selected ? "answer-selected" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="answer-letter">{String.fromCharCode(65 + index)}</span>

      <span>{option}</span>
    </button>
  );
}

export default AnswerButton;
