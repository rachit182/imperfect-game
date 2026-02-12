import { useContext } from "react";
import { GameContext } from "../state/GameContext";

export default function EventPopup() {
  const { state, dispatch } = useContext(GameContext);

  if (state.activeEvent !== "ILLEGAL_DUMPING") return null;

  return (
    <div className="popup">
      <h2>Illegal Waste Dumping</h2>
      <p>The factory is dumping waste illegally at night.</p>

      <button
        onClick={() => {
          dispatch({ type: "RESOLVE_EVENT" });
        }}
      >
        Stay Silent
      </button>
    </div>
  );
}
