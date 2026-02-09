export const initialState = {
  turn: 0,
  maxTurns: 6,
  phase: "DECISION",

  // visible to player
  player: {
    money: 50,
    jobSecurity: 50,
    wellbeing: 50,
    localEnvironment: 50
  },

  // hidden system variables
  system: {
    economy: 60,
    equity: 50,
    environment: 60,
    publicSatisfaction: 55
  },

  seaLevel: 0,
  seaLevelRate: 0.15
};

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}

function applyEffects(target, effects = {}) {
  const updated = { ...target };
  for (const key in effects) {
    updated[key] = clamp((updated[key] || 0) + effects[key]);
  }
  return updated;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "MAKE_DECISION":
      return {
        ...state,
        player: applyEffects(state.player, action.payload.playerEffects),
        system: applyEffects(state.system, action.payload.systemEffects),
        phase: "RESOLUTION"
      };

    case "RESOLVE_TURN":
      const nextTurn = state.turn + 1;
      return {
        ...state,
        turn: nextTurn,
        seaLevel: state.seaLevel + state.seaLevelRate,
        phase: nextTurn >= state.maxTurns ? "END" : "DECISION"
      };

    default:
      return state;
  }
}
