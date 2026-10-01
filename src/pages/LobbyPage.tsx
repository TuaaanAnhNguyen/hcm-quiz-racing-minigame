// src/pages/LobbyPage.tsx

import { useState } from "react";
import { useGameStore } from "../store/useGameStore";

const CAR_COLORS = [
  {
    name: "Blue",
    value: "#3b82f6",
    dark: "#1d4ed8",
  },
  {
    name: "Green",
    value: "#22c55e",
    dark: "#15803d",
  },
  {
    name: "Red",
    value: "#ef4444",
    dark: "#b91c1c",
  },
  {
    name: "Yellow",
    value: "#facc15",
    dark: "#a16207",
  },
];

function LobbyPage() {
  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const startGame = useGameStore((state) => state.startGame);

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CAR_COLORS[0].value);
  const [error, setError] = useState("");

  const handleStart = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your player name.");
      return;
    }

    setError("");

    registerPlayer(trimmedName, selectedColor);
    startGame();
  };

  return (
    <main className="lobby-page">
      <div className="lobby-background-grid" />

      <section className="lobby-container">
        <header className="lobby-header">
          <div className="logo-mark">
            <span>🏎️</span>
          </div>

          <div>
            <div className="game-title-small">HCM</div>
            <h1>QUIZ RACING</h1>
          </div>
        </header>

        <div className="race-line" />

        <section className="lobby-content">
          <div className="lobby-intro">
            <p className="section-label">READY TO RACE?</p>

            <h2>
              Test your knowledge.
              <br />
              <span>Race to the finish.</span>
            </h2>

            <p className="intro-text">
              Answer questions correctly and race through all four stages of Ho
              Chi Minh City trivia.
            </p>
          </div>

          <div className="player-setup">
            <div className="setup-section">
              <label htmlFor="player-name">PLAYER NAME</label>

              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleStart();
                  }
                }}
                placeholder="Enter your name..."
                maxLength={20}
                autoComplete="off"
              />
            </div>

            <div className="setup-section">
              <span className="setup-label">CHOOSE YOUR CAR</span>

              <div className="car-grid">
                {CAR_COLORS.map((car) => {
                  const selected = selectedColor === car.value;

                  return (
                    <button
                      key={car.value}
                      type="button"
                      className={`car-choice ${
                        selected ? "car-choice-selected" : ""
                      }`}
                      onClick={() => setSelectedColor(car.value)}
                      aria-pressed={selected}
                    >
                      <div
                        className="car-preview"
                        style={{
                          backgroundColor: car.value,
                          borderColor: selected ? car.dark : "transparent",
                        }}
                      >
                        🏎️
                      </div>

                      <span>{car.name}</span>

                      {selected && (
                        <div
                          className="car-selected-dot"
                          style={{ backgroundColor: car.value }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="button" className="race-button" onClick={handleStart}>
              <span>START RACE</span>
              <span className="race-button-arrow">→</span>
            </button>
          </div>
        </section>

        <footer className="lobby-footer">
          <span>4 STAGES</span>
          <span>•</span>
          <span>LOCAL RACE</span>
          <span>•</span>
          <span>QUIZ + RACING</span>
        </footer>
      </section>
    </main>
  );
}

export default LobbyPage;
