import { useState } from "react";
import GameIntro from "./pages/GameIntro";

export default function App() {
  const [screen, setScreen] = useState("intro");

  return (
    <div className="app">
      {screen === "intro" && (
        <GameIntro onStart={() => setScreen("game")} />
      )}

      {screen === "game" && (
        <div className="game">
          <h1>Imperfect</h1>
          <p>Game starts here.</p>

          {/* Later replace this block with <Game /> */}
          <button onClick={() => setScreen("intro")}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
