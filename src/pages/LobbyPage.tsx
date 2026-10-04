// src/pages/LobbyPage.tsx

import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { CAR_OPTIONS } from "../data/cars";
import { getRoomRoute } from "../lib/roomRouting";

function LobbyPage() {
  const route = getRoomRoute();
  const roomCode = route.roomCode;

  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const connectionStatus = useGameStore((state) => state.connectionStatus);
  const players = useGameStore((state) => state.players);

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [name, setName] = useState("");
  const [selectedCar, setSelectedCar] = useState(CAR_OPTIONS[0].id);
  const [error, setError] = useState("");
  const [joinRequested, setJoinRequested] = useState(false);

  const playerStorageKey = roomCode
    ? `hcm-quiz-racing-player-${roomCode}`
    : null;

  const existingPlayerId = playerStorageKey
    ? window.localStorage.getItem(playerStorageKey)
    : null;

  const joined = Boolean(
    existingPlayerId &&
    players.some((player) => player.id === existingPlayerId),
  );

  const handleRoomSubmit = () => {
    const code = roomCodeInput.trim().toUpperCase();

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError("Please enter a valid 6-character room code.");
      return;
    }

    window.location.href = `/${code}`;
  };

  const handleJoin = () => {
    const trimmedName = name.trim();

    if (!roomCode) return;

    if (!trimmedName) {
      setError("Please enter your player name.");
      return;
    }

    if (connectionStatus !== "connected") {
      setError("Please wait until you are connected to the room.");
      return;
    }

    setError("");

    const playerId = existingPlayerId ?? crypto.randomUUID();
    window.localStorage.setItem(playerStorageKey!, playerId);

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
            <p className="section-label">
              {roomCode ? "READY TO RACE?" : "JOIN THE RACE"}
            </p>

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
            {!roomCode ? (
              <>
                <div className="setup-section">
                  <label htmlFor="room-code">ROOM CODE</label>

                  <input
                    id="room-code"
                    type="text"
                    value={roomCodeInput}
                    onChange={(event) => {
                      setRoomCodeInput(
                        event.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 6),
                      );
                      if (error) setError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleRoomSubmit();
                    }}
                    placeholder="Enter 6-character code..."
                    maxLength={6}
                    autoComplete="off"
                  />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="button"
                  className="race-button"
                  onClick={handleRoomSubmit}
                >
                  <span>JOIN ROOM</span>
                  <span className="race-button-arrow">→</span>
                </button>

                <p className="intro-text">Ask your host for the room code.</p>
              </>
            ) : (
              <>
                <div className="setup-section">
                  <label htmlFor="player-name">PLAYER NAME</label>

                  <input
                    id="player-name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (error) setError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleJoin();
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
                    {joined
                      ? "You are in the race. Waiting for the admin to start."
                      : "Requesting a race slot..."}
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
                      ? "Multiplayer is unavailable. Check the Supabase configuration."
                      : connectionStatus === "error"
                        ? "Could not connect to this room. Please try again."
                        : "Connecting to the race..."}
                  </p>
                )}

                <p className="intro-text">
                  Room code: <strong>{roomCode}</strong>
                </p>
              </>
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
