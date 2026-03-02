import { useContext } from "react";
import { GameProvider } from "./state/GameContext";
import { GameContext } from "./state/GameContext";
import Dashboard from "./components/Dashboard";
import EndScreen from "./components/EndScreen";
import Controls from "./components/Controls";
import EventPopup from "./components/EventPopup";


function GameScreen() {
  const { state } = useContext(GameContext);

  if (state.meta.gameOver) {
    return <EndScreen state={state} />;
  }

  return (
    <div className="container">
      <h1>Imperfect the game</h1>
      <Dashboard />
      <Controls />
      <EventPopup />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}
