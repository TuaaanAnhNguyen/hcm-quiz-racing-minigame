// src/App.tsx

import "./App.css";

import { useGameStore } from "./store/useGameStore";
import { GameState } from "./types/game";

import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import SummaryPage from "./pages/SummaryPage";

function App() {
  const status = useGameStore((state) => state.status);

  switch (status) {
    case GameState.LOBBY:
      return <LobbyPage />;

    case GameState.PLAYING:
    case GameState.PAUSED:
    case GameState.STAGE_TRANSITION:
      return <GamePage />;

    case GameState.SUMMARY:
      return <SummaryPage />;

    default:
      return <LobbyPage />;
  }
}

export default App;
