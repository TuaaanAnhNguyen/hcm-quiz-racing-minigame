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
      setError("Vui lòng nhập mã phòng gồm 6 ký tự hợp lệ.");
      return;
    }

    window.location.href = `/${code}`;
  };

  const handleJoin = () => {
    const trimmedName = name.trim();

    if (!roomCode) return;

    if (!trimmedName) {
      setError("Vui lòng nhập tên người chơi.");
      return;
    }

    if (connectionStatus !== "connected") {
      setError("Vui lòng chờ kết nối với phòng trước khi tham gia.");
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
              {roomCode ? "SẴN SÀNG ĐUA CHƯA?" : "THAM GIA CUỘC ĐUA"}
            </p>

            <h2>
              Thử sức kiến thức.
              <br />
              <span>Tăng tốc về đích.</span>
            </h2>

            <p className="intro-text">
              Trả lời chính xác để chinh phục cả bốn chặng đua kiến thức về tư
              tưởng Hồ Chí Minh về con người.
            </p>
          </div>

          <div className="player-setup">
            {!roomCode ? (
              <>
                <div className="setup-section">
                  <label htmlFor="room-code">MÃ PHÒNG</label>

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
                    placeholder="Nhập mã gồm 6 ký tự..."
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
                  <span>VÀO PHÒNG</span>
                  <span className="race-button-arrow">→</span>
                </button>

                <p className="intro-text">Hãy hỏi quản trò để nhận mã phòng.</p>
              </>
            ) : (
              <>
                <div className="setup-section">
                  <label htmlFor="player-name">TÊN NGƯỜI CHƠI</label>

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
                    placeholder="Nhập tên của bạn..."
                    maxLength={20}
                    autoComplete="off"
                  />
                </div>

                <div className="setup-section">
                  <span className="setup-label">CHỌN XE ĐUA</span>

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
                      ? "Bạn đã vào phòng. Đang chờ quản trò bắt đầu."
                      : "Đang gửi yêu cầu tham gia..."}
                  </p>
                ) : (
                  <button
                    type="button"
                    className="race-button"
                    onClick={handleJoin}
                    disabled={connectionStatus !== "connected"}
                  >
                    <span>THAM GIA ĐUA</span>
                    <span className="race-button-arrow">→</span>
                  </button>
                )}

                {connectionStatus !== "connected" && (
                  <p className="form-error">
                    {connectionStatus === "offline"
                      ? "Không thể kết nối nhiều người chơi. Hãy kiểm tra cấu hình Supabase."
                      : connectionStatus === "error"
                        ? "Không thể kết nối phòng. Vui lòng thử lại."
                        : "Đang kết nối phòng..."}
                  </p>
                )}

                <p className="intro-text">
                  Mã phòng: <strong>{roomCode}</strong>
                </p>
              </>
            )}
          </div>
        </section>

        <footer className="lobby-footer">
          <span>4 CHẶNG</span>
          <span>•</span>
          <span>ĐUA TRỰC TIẾP</span>
          <span>•</span>
          <span>KIẾN THỨC + ĐUA XE</span>
        </footer>
      </section>
    </main>
  );
}

export default LobbyPage;
