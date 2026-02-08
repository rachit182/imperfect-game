import { GameProvider, useGame } from "./GameContext";
import Dashboard from "./components/Dashboard";
import IslandView from "./components/IslandView";
import DecisionPanel from "./components/DecisionPanel";
import EndScreen from "./components/EndScreen";

function Game() {
  const { state } = useGame();

  if (state.phase === "END") {
    return <EndScreen />;
  }

  return (
    <div className="app">
      <Dashboard />
      <IslandView />
      <DecisionPanel />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
