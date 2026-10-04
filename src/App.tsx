// src/App.tsx

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

import { useGameStore } from "./store/useGameStore";
import { GameState } from "./types/game";

import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import SummaryPage from "./pages/SummaryPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const status = useGameStore((state) => state.status);
  const loadQuestions = useGameStore((state) => state.loadQuestions);
  const isAdmin = useGameStore((state) => state.isAdmin);

  useEffect(() => {
    if (isAdmin) void loadQuestions();
  }, [isAdmin, loadQuestions]);

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
        key={status}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        style={{ minHeight: "100vh" }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
