import { useContext } from "react";
import { GameContext } from "../state/GameContext";

export default function Controls() {
  const { state, dispatch } = useContext(GameContext);
  const HOURS_PER_DAY = 24;
  const WORK_HOURS = 8;
  const EXTRA_SHIFT_HOURS = 8;
  const SLEEP_HOURS = 8;
  const canDecideWork = !state.meta.workDecisionMade;
  const canTakeExtraShift =
    state.meta.workDecisionMade &&
    state.meta.hoursUsed + EXTRA_SHIFT_HOURS <= HOURS_PER_DAY;
  const canSleep =
    state.meta.workDecisionMade &&
    state.meta.hoursUsed + SLEEP_HOURS <= HOURS_PER_DAY;

  return (
    <div className="controls">
      <button
        onClick={() => dispatch({ type: "GO_TO_WORK" })}
        disabled={
          !canDecideWork || state.meta.hoursUsed + WORK_HOURS > HOURS_PER_DAY
        }
      >
        Go To Work
      </button>

      <button
        onClick={() => dispatch({ type: "SKIP_WORK" })}
        disabled={!canDecideWork}
      >
        Skip Work
      </button>

      <button
        onClick={() => dispatch({ type: "EXTRA_SHIFT" })}
        disabled={!canTakeExtraShift}
      >
        Take Extra Shift
      </button>

      <button onClick={() => dispatch({ type: "SLEEP" })} disabled={!canSleep}>
        Sleep
      </button>
    </div>
  );
}
