import { useGame } from "../GameContext";

export default function EndScreen() {
  const { state } = useGame();

  return (
    <div className="end">
      <h2>You did what you could.</h2>

      <h3>Your Life</h3>
      <pre>{JSON.stringify(state.player, null, 2)}</pre>

      <h3>The System</h3>
      <pre>{JSON.stringify(state.system, null, 2)}</pre>

      <p className="message">
        The system kept changing, even when you had no control.
      </p>
    </div>
  );
}
