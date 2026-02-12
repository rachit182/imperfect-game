import { useContext } from "react";
import { GameContext } from "../state/GameContext";

export default function Controls() {
  const { state, dispatch } = useContext(GameContext);
  const HOURS_PER_DAY = 24;
  const WORK_HOURS = 8;
  const EXTRA_SHIFT_HOURS = 8;
  const SLEEP_HOURS = 8;
  const hasActiveEvent = Boolean(state.activeEvent);
  const canBuildHome = !state.player.home.hasConcreteBarrier && !hasActiveEvent;
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
        onClick={() => dispatch({ type: "REQUEST_BUILD_HOME" })}
        disabled={!canBuildHome}
      >
        Build Home
      </button>

      <button
        onClick={() => dispatch({ type: "GO_TO_WORK" })}
        disabled={
          hasActiveEvent ||
          !canDecideWork ||
          state.meta.hoursUsed + WORK_HOURS > HOURS_PER_DAY
        }
      >
        Go To Work
      </button>

      <button
        onClick={() => dispatch({ type: "SKIP_WORK" })}
        disabled={hasActiveEvent || !canDecideWork}
      >
        Skip Work
      </button>

      <button
        onClick={() => dispatch({ type: "EXTRA_SHIFT" })}
        disabled={hasActiveEvent || !canTakeExtraShift}
      >
        Take Extra Shift (0.75x/8hr)
      </button>

      <button
        onClick={() => dispatch({ type: "SLEEP" })}
        disabled={hasActiveEvent || !canSleep}
      >
        Sleep
      </button>
    </div>
  );
}
