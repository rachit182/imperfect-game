import { useGame } from "../GameContext";
import Meter from "./Meter";

export default function Dashboard() {
  const { state } = useGame();
  const { metrics, seaLevel } = state;

  return (
    <div className="dashboard">
      <Meter label="Environment" value={metrics.environment} />
      <Meter label="Economy" value={metrics.economy} />
      <Meter label="Equity" value={metrics.equity} />
      <Meter label="Satisfaction" value={metrics.satisfaction} />
      <p className="sea">Sea Level: {(seaLevel * 100).toFixed(0)}%</p>
    </div>
  );
}
