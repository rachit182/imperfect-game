import { useContext } from "react";
import { GameContext } from "../state/GameContext";

export default function Controls() {
  const { state, dispatch } = useContext(GameContext);
  const HOURS_PER_DAY = 24;
  const WORK_HOURS = 8;
  const EXTRA_SHIFT_HOURS = 8;
  const SLEEP_HOURS = 8;
  const hasActiveEvent = Boolean(state.activeEvent);
  const canImproveHome =
    !state.player.home.hasConcreteBarrier && !hasActiveEvent;
  const canDecideWork = !state.meta.workDecisionMade;
  const canTakeExtraShift =
    state.meta.workDecisionMade &&
    state.meta.hoursUsed + EXTRA_SHIFT_HOURS <= HOURS_PER_DAY;
  const canSleep =
    state.meta.workDecisionMade &&
    state.meta.hoursUsed + SLEEP_HOURS <= HOURS_PER_DAY;
  const canTakeSkipFollowUp =
    state.meta.workDecisionMade && state.meta.lastActionType === "SKIP_WORK";

  const choices = [];

  if (!hasActiveEvent) {
    // Improve home is permanently prioritized when available.
    if (canImproveHome) {
      choices.push({
        type: "REQUEST_BUILD_HOME",
        label: "Improve Home",
        priority: 100,
        mustInclude: true
      });
    }

    if (canDecideWork) {
      if (state.meta.hoursUsed + WORK_HOURS <= HOURS_PER_DAY) {
        choices.push({
          type: "GO_TO_WORK",
          label: "Go To Work",
          priority: 90
        });
      }

      choices.push({
        type: "SKIP_WORK",
        label: "Skip Work",
        priority: 80
      });
    } else if (canTakeSkipFollowUp) {
      if (state.meta.hoursUsed + WORK_HOURS <= HOURS_PER_DAY) {
        choices.push({
          type: "FAMILY_REST_DAY",
          label: "Family / Rest Day",
          priority: 90
        });
        choices.push({
          type: "COMMUNITY_CLEANUP",
          label: "Community Cleanup",
          priority: 85
        });
      }
    } else {
      if (canTakeExtraShift) {
        choices.push({
          type: "EXTRA_SHIFT",
          label: "Take Extra Shift (0.75x/8hr)",
          priority: 90
        });
      }
      if (canSleep) {
        choices.push({
          type: "SLEEP",
          label: "Sleep",
          priority: 85
        });
      }
    }
  }

  const mustInclude = choices.filter((choice) => choice.mustInclude);
  const optional = choices
    .filter((choice) => !choice.mustInclude)
    .sort((a, b) => b.priority - a.priority);
  const visibleChoices = [...mustInclude, ...optional].slice(0, 3);

  return (
    <div className="controls">
      {visibleChoices.map((choice, index) => (
        <button
          key={choice.type}
          onClick={() => dispatch({ type: choice.type })}
        >
          Choice Button {index}: {choice.label}
        </button>
      ))}
    </div>
  );
}
