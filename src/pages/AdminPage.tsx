// src/pages/AdminPage.tsx

import { useCallback, useState } from "react";
import { Eye, Flag, Play, RotateCcw, SkipForward, Pause, Copy } from "lucide-react";
import SpectatorView from "../components/game/SpectatorView";
import { useGameStore } from "../store/useGameStore";
import { GameState } from "../types/game";
import { getRoomRoute } from "../lib/roomRouting";

const STATUS_LABELS: Record<GameState, string> = {
  [GameState.LOBBY]: "Sảnh chờ",
  [GameState.PLAYING]: "Đang thi đấu",
  [GameState.PAUSED]: "Đã tạm dừng",
  [GameState.QUESTION_RESULT]: "Kết quả câu hỏi",
  [GameState.STAGE_TRANSITION]: "Chuyển chặng",
  [GameState.SUMMARY]: "Đã kết thúc",
};

function AdminPage() {
  const status = useGameStore((state) => state.status);
  const stage = useGameStore((state) => state.stage);
  const questions = useGameStore((state) => state.questions);
  const currentQuestionIndex = useGameStore(
    (state) => state.currentQuestionIndex,
  );
  const questionsPerStage = useGameStore((state) => state.questionsPerStage);
  const players = useGameStore((state) => state.players);
  const connectionStatus = useGameStore((state) => state.connectionStatus);
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const revealQuestion = useGameStore((state) => state.revealQuestion);
  const timeExpired = useGameStore((state) => state.timeExpired);
  const nextQuestion = useGameStore((state) => state.nextQuestion);
  const skipQuestion = useGameStore((state) => state.skipQuestion);
  const forceNextStage = useGameStore((state) => state.forceNextStage);
  const continueStage = useGameStore((state) => state.continueStage);
  const resetGame = useGameStore((state) => state.resetGame);
  const getTimeRemaining = useGameStore((state) => state.getTimeRemaining);

  const { roomCode } = getRoomRoute();
  const [copiedItem, setCopiedItem] = useState<"code" | "link" | null>(null);

  const inviteUrl = roomCode ? `${window.location.origin}/${roomCode}` : "";

  const handleCopy = async (value: string, item: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(item);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleExpire = useCallback(() => {
    if (status === GameState.PLAYING) timeExpired();
  }, [status, timeExpired]);

  const currentQuestion = questions[currentQuestionIndex];
  const controlEnabled = connectionStatus === "connected";

  return (
    <main className="game-page admin-page">
      <section className="game-card spectator-card">
        <header className="spectator-header">
          <div>
            <p className="eyebrow">HCM QUIZ RACING · QUẢN TRÒ</p>
            <h1>Điều khiển cuộc đua</h1>
            <p className="spectator-subtitle">
              Chặng {stage} · {STATUS_LABELS[status]} · {players.length} tay đua
            </p>
          </div>
          <div className="spectator-header-actions">
            <span
              className={`connection-status connection-${connectionStatus}`}
            >
              {connectionStatus === "connected"
                ? "Đã kết nối trực tiếp"
                : connectionStatus === "offline"
                  ? "Chưa cấu hình kết nối"
                  : connectionStatus === "connecting"
                    ? "Đang kết nối"
                    : "Lỗi kết nối"}
            </span>
          </div>
        </header>

        {roomCode && (
          <section className="room-invite-panel">
            <div className="room-invite-info">
              <p className="eyebrow">MỜI NGƯỜI CHƠI</p>
              <h2>Mã phòng</h2>
              <p>
                Gửi mã này cho người chơi để họ tham gia cuộc đua.
              </p>

              <div className="room-code-display">{roomCode}</div>
            </div>

            <div className="room-invite-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => void handleCopy(roomCode, "code")}
              >
                <Copy size={16} aria-hidden="true" />
                {copiedItem === "code" ? "Đã sao chép mã!" : "Sao chép mã phòng"}
              </button>

              <div className="room-invite-link">
                <label htmlFor="player-invite-url">
                  LIÊN KẾT MỜI NGƯỜI CHƠI
                </label>
                <input
                  id="player-invite-url"
                  type="text"
                  value={inviteUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void handleCopy(inviteUrl, "link")}
                >
                  <Copy size={16} aria-hidden="true" />
                  {copiedItem === "link" ? "Đã sao chép liên kết!" : "Sao chép liên kết mời"}
                </button>
              </div>
            </div>
          </section>
        )}

        {!controlEnabled && (
          <p className="admin-notice">
            Hãy cấu hình Supabase Realtime để kết nối thiết bị người chơi. Quản
            trò vẫn là nơi duy nhất quyết định trạng thái và kết quả cuộc đua.
          </p>
        )}

        <section className="host-controls" aria-label="Điều khiển cuộc đua">
          <div>
            <p className="eyebrow">ĐIỀU KHIỂN CUỘC ĐUA</p>
            <strong>
              {currentQuestion?.question ??
                (status === GameState.LOBBY
                  ? "Đang chờ người chơi"
                  : "Cuộc đua đã kết thúc")}
            </strong>
          </div>
          <div className="host-control-actions">
            {status === GameState.LOBBY && (
              <button
                type="button"
                className="primary-button"
                onClick={startGame}
                disabled={!questions.length || !players.length}
              >
                <Play size={16} aria-hidden="true" />
                Bắt đầu cuộc đua
              </button>
            )}
            {status === GameState.PLAYING && (
              <button
                type="button"
                className="secondary-button"
                onClick={pauseGame}
              >
                <Pause size={16} aria-hidden="true" />
                Tạm dừng
              </button>
            )}
            {status === GameState.PAUSED && (
              <button
                type="button"
                className="primary-button"
                onClick={resumeGame}
              >
                <Play size={16} aria-hidden="true" />
                Tiếp tục
              </button>
            )}
            {status === GameState.QUESTION_RESULT && (
              <button
                type="button"
                className="primary-button"
                onClick={nextQuestion}
              >
                <Play size={16} aria-hidden="true" />
                Câu hỏi tiếp theo
              </button>
            )}
            {status === GameState.STAGE_TRANSITION && (
              <button
                type="button"
                className="primary-button"
                onClick={continueStage}
              >
                <Play size={16} aria-hidden="true" />
                {stage === 4 ? "Xem kết quả" : "Bắt đầu chặng tiếp theo"}
              </button>
            )}
            {(status === GameState.PLAYING || status === GameState.PAUSED) && (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={revealQuestion}
                >
                  <Eye size={16} aria-hidden="true" />
                  Công bố kết quả
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={skipQuestion}
                >
                  <SkipForward size={16} aria-hidden="true" />
                  Bỏ qua câu hỏi
                </button>
                <button
                  type="button"
                  className="primary-button host-force-button"
                  onClick={forceNextStage}
                >
                  <Flag size={16} aria-hidden="true" />
                  {stage === 4 ? "Kết thúc cuộc đua" : "Chuyển sang chặng tiếp"}
                </button>
              </>
            )}
            {status === GameState.SUMMARY && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetGame}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Chơi lại
              </button>
            )}
          </div>
        </section>

        <SpectatorView
          stage={stage}
          currentQuestionIndex={currentQuestionIndex}
          questionsPerStage={questionsPerStage}
          players={players}
          isPaused={status === GameState.PAUSED}
          showTimer={
            status === GameState.PLAYING || status === GameState.PAUSED
          }
          getTimeRemaining={getTimeRemaining}
          onExpire={handleExpire}
        />
      </section>
    </main>
  );
}

export default AdminPage;
