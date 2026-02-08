export const initialState = {
  turn: 0,
  maxTurns: 6,
  phase: "DECISION",

  metrics: {
    environment: 50,
    economy: 50,
    equity: 50,
    satisfaction: 50
  },

  seaLevel: 0,
  seaLevelRate: 0.15
};

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "MAKE_DECISION": {
      const effects = action.payload.effects;

      return {
        ...state,
        metrics: {
          environment: clamp(state.metrics.environment + effects.environment),
          economy: clamp(state.metrics.economy + effects.economy),
          equity: clamp(state.metrics.equity + effects.equity),
          satisfaction: clamp(state.metrics.satisfaction + effects.satisfaction)
        },
        phase: "RESOLUTION"
      };
    }

    case "RESOLVE_TURN": {
      const nextTurn = state.turn + 1;
      const newSeaLevel = state.seaLevel + state.seaLevelRate;

      return {
        ...state,
        turn: nextTurn,
        seaLevel: newSeaLevel,
        phase: nextTurn >= state.maxTurns ? "END" : "DECISION"
      };
    }

    default:
      return state;
  }
}
