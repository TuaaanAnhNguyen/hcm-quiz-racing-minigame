// src/pages/SummaryPage.tsx

import { useGameStore } from "../store/useGameStore";

function SummaryPage() {
  const players = useGameStore((state) => state.players);
  const resetGame = useGameStore((state) => state.resetGame);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <main className="summary-page">
      <section className="summary-card">
        <div className="summary-header">
          <span className="summary-trophy">🏆</span>

          <p className="eyebrow">Race Finished</p>

          <h1>Final Results</h1>

          <p>You completed all four stages.</p>
        </div>

        <div className="podium-list">
          {sortedPlayers.map((player, index) => (
            <div className="result-row" key={player.id}>
              <div className="result-position">#{index + 1}</div>

              <span
                className="mini-car"
                style={{ backgroundColor: player.carSprite }}
              >
                🏎️
              </span>

              <div className="result-player">
                <strong>{player.name}</strong>
                <span>{player.correctAnswersCount} correct answers</span>
              </div>

              <strong className="result-score">{player.score}</strong>
            </div>
          ))}
        </div>

        <button type="button" className="primary-button" onClick={resetGame}>
          Race Again
        </button>
      </section>
    </main>
  );
}

export default SummaryPage;
