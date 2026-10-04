// src/pages/LobbyPage.tsx

import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { CAR_OPTIONS } from "../data/cars";

function LobbyPage() {
  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const connectionStatus = useGameStore((state) => state.connectionStatus);
  const players = useGameStore((state) => state.players);

  const [name, setName] = useState("");
  const [selectedCar, setSelectedCar] = useState(CAR_OPTIONS[0].id);
  const [error, setError] = useState("");
  const [joinRequested, setJoinRequested] = useState(false);

  const existingPlayerId = window.localStorage.getItem("hcm-quiz-racing-player");
  const joined = Boolean(
    existingPlayerId && players.some((player) => player.id === existingPlayerId),
  );

  const handleJoin = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your player name.");
      return;
    }

    setError("");
    const playerId = existingPlayerId ?? crypto.randomUUID();
    window.localStorage.setItem("hcm-quiz-racing-player", playerId);
    registerPlayer(trimmedName, selectedCar, playerId);
    setJoinRequested(true);
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
                    handleJoin();
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
                {CAR_OPTIONS.map((car) => {
                  const selected = selectedCar === car.id;

                  return (
                    <button
                      key={car.id}
                      type="button"
                      className={`car-choice ${
                        selected ? "car-choice-selected" : ""
                      }`}
                      onClick={() => setSelectedCar(car.id)}
                      aria-pressed={selected}
                    >
                      <div className="car-preview">
                        <img src={car.image} alt={car.name} />
                      </div>

                      <span className="car-name">{car.name}</span>

                      {selected && <div className="car-selected-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            {joined || joinRequested ? (
              <p className="answered-message">
                {joined ? "You are in the race. Waiting for the admin to start." : "Requesting a race slot..."}
              </p>
            ) : (
              <button
                type="button"
                className="race-button"
                onClick={handleJoin}
                disabled={connectionStatus !== "connected"}
              >
              <span>JOIN RACE</span>
              <span className="race-button-arrow">→</span>
              </button>
            )}
            {connectionStatus !== "connected" && (
              <p className="form-error">
                {connectionStatus === "offline"
                  ? "Multiplayer is unavailable until Supabase is configured."
                  : "Connecting to the race..."}
              </p>
            )}
          </div>
        </section>

        <footer className="lobby-footer">
          <span>4 STAGES</span>
          <span>•</span>
          <span>LIVE RACE</span>
          <span>•</span>
          <span>QUIZ + RACING</span>
        </footer>
      </section>
    </main>
  );
}

export default LobbyPage;
