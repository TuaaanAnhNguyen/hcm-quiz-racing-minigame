// src/App.tsx

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

import { useGameStore } from "./store/useGameStore";
import { GameState } from "./types/game";
import { getRoomRoute } from "./lib/roomRouting";

import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import SummaryPage from "./pages/SummaryPage";
import AdminPage from "./pages/AdminPage";
import HostSetupPage from "./pages/HostSetupPage";

function App() {
  const route = getRoomRoute();
  const status = useGameStore((state) => state.status);
  const loadQuestions = useGameStore((state) => state.loadQuestions);
  const isAdmin = useGameStore((state) => state.isAdmin);

  useEffect(() => {
    if (isAdmin) void loadQuestions();
  }, [isAdmin, loadQuestions]);

  if (route.isHostSetup) {
    return <HostSetupPage />;
  }

  if (route.isInvalidHost) {
    return (
      <main className="transition-page">
        <section className="transition-card">
          <p className="eyebrow">HCM QUIZ RACING</p>
          <h1>Liên kết quản trò không hợp lệ</h1>
          <p>
            Liên kết này không hợp lệ hoặc không có trong trình duyệt hiện tại.
            Hãy tạo phòng mới để bắt đầu cuộc đua.
          </p>
          <a className="race-button" href="/host">
            Tạo phòng mới
          </a>
        </section>
      </main>
    );
  }

  if (isAdmin) {
    return <AdminPage />;
  }

  const renderPage = () => {
    switch (status) {
      case GameState.LOBBY:
        return <LobbyPage />;
      case GameState.PLAYING:
      case GameState.PAUSED:
      case GameState.QUESTION_RESULT:
      case GameState.STAGE_TRANSITION:
        return <GamePage />;
      case GameState.SUMMARY:
        return <SummaryPage />;
      default:
        return <LobbyPage />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${route.roomCode ?? "home"}-${status}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ minHeight: "100vh" }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
