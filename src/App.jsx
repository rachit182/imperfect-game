import { GameProvider } from "./state/GameContext";
import Dashboard from "./components/Dashboard";
import Controls from "./components/Controls";
import EventPopup from "./components/EventPopup";

export default function App() {
  return (
    <GameProvider>
      <div className="container">
        <h1>Imperfect the game</h1>
        <Dashboard />
        <Controls />
        <EventPopup />
      </div>
    </GameProvider>
  );
}
