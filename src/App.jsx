import AppShell from "./app/AppShell";
import { GameProvider } from "./features/game/state/GameContext";

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
