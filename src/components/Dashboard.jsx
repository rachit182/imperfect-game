import { useGame } from "../GameContext";
import Meter from "./Meter";

export default function Dashboard() {
  const { state } = useGame();
  const { player } = state;

  return (
    <div className="dashboard">
      <Meter label="Money" value={player.money} />
      <Meter label="Job Security" value={player.jobSecurity} />
      <Meter label="Well-being" value={player.wellbeing} />
      <Meter label="Local Environment" value={player.localEnvironment} />
    </div>
  );
}
