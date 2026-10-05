// src/pages/SummaryPage.tsx

import { useGameStore } from "../store/useGameStore";
import Podium from "../components/summary/Podium";

function SummaryPage() {
  const players = useGameStore((state) => state.players);
  const resetGame = useGameStore((state) => state.resetGame);

  const handlePlayAgain = () => {
    resetGame();
    window.location.assign("/");
  };

  return (
    <main className="summary-page">
      <section className="summary-card">
        <div className="summary-header">
          <span className="summary-trophy">🏆</span>

          <p className="eyebrow">Cuộc đua kết thúc</p>

          <h1>Kết quả chung cuộc</h1>

          <p>Bạn đã hoàn thành cả bốn chặng đua.</p>
        </div>

        <Podium players={players} />

        <button
          type="button"
          className="primary-button"
          onClick={handlePlayAgain}
        >
          Đua lại
        </button>
      </section>
    </main>
  );
}

export default SummaryPage;
