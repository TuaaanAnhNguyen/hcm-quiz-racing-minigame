// src/components/Timer.tsx

import { useEffect, useState } from "react";

interface TimerProps {
  getTimeRemaining: () => number;
  onExpire: () => void;
}

function Timer({ getTimeRemaining, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining());

  useEffect(() => {
    let expired = false;

    const updateTimer = () => {
      const remaining = Math.max(0, getTimeRemaining());

      setTimeLeft(remaining);

      if (remaining <= 0 && !expired) {
        expired = true;
        onExpire();
      }
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [getTimeRemaining, onExpire]);

  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className={`timer ${seconds <= 5 ? "timer-warning" : ""}`}>
      <span className="timer-label">Time</span>
      <strong>{seconds}s</strong>
    </div>
  );
}

export default Timer;
