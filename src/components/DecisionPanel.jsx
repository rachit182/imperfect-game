import { useGame } from "../GameContext";
import { decisions } from "../data/decisions";

export default function DecisionPanel() {
  const { state, dispatch } = useGame();

  if (state.phase !== "DECISION") return null;

  function handleDecision(decision) {
    dispatch({ type: "MAKE_DECISION", payload: decision });

    setTimeout(() => {
      dispatch({ type: "RESOLVE_TURN" });
    }, 700);
  }

  return (
    <div className="decisions">
      {decisions.map((d, i) => (
        <button key={i} onClick={() => handleDecision(d)}>
          {d.label}
        </button>
      ))}
    </div>
  );
}
