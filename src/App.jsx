import { useContext } from "react";
import { GameProvider, GameContext } from "./state/GameContext";
import Dashboard from "./components/Dashboard";
import EndScreen from "./components/EndScreen";
import Controls from "./components/Controls";
import EventPopup from "./components/EventPopup";
import StartScreen from "./components/StartScreen";

function GameScreen() {
  const { state, dispatch } = useContext(GameContext);

  if (!state.meta.started) {
    return <StartScreen onStart={() => dispatch({ type: "START_GAME" })} />;
  }

  if (state.meta.gameOver) {
    return <EndScreen state={state} />;
  }

  return (
    <div className="game-screen">
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