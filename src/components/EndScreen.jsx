import { useGame } from "../GameContext";

export default function EndScreen() {
  const { state } = useGame();
  const { metrics, seaLevel } = state;

  return (
    <div className="end">
      <h2>Final Metrics</h2>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>

      <div className="island end-island">
        <div
          className="water"
          style={{ height: `${seaLevel * 100}%` }}
        />
      </div>

      <p className="message">Every solution breaks something.</p>
    </div>
  );
}
