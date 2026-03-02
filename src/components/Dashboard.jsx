// src/components/Dashboard.jsx
import { useGame } from "../GameContext";
import Meter from "./Meter";
import "./Hud.css";

export default function Dashboard() {
  const { state } = useGame();
  const { player } = state;

  return (
    <header className="hud">
      <div className="hud__inner">
        <div className="hud__left">
          <div className="hud__kicker">STATUS</div>
          <div className="hud__subtitle">Keep your family afloat.</div>
        </div>

        <div className="hud__meters">
          <Meter label="Money" value={player.money} />
          <Meter label="Job Security" value={player.jobSecurity} />
          <Meter label="Well-being" value={player.wellbeing} />
          <Meter label="Local Env" value={player.localEnvironment} />
        </div>
      </div>
    </header>
  );
}
