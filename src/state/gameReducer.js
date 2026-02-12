const HOURS_PER_DAY = 24;

function applyDayEndEffects(state) {
  let newState = {
    ...state,
    meta: { ...state.meta },
    player: { ...state.player },
    environment: { ...state.environment },
    factory: { ...state.factory },
    society: { ...state.society }
  };

  // Production
  if (newState.factory.stability >= 60) {
    newState.player.money += 300;
    newState.environment.aqi += 20;
    newState.factory.toxicWaste += 50;
    newState.environment.waterLevel -= 5;
    newState.factory.equipmentWear += 5;
  }

  // Natural water decline
  newState.environment.waterLevel -= 2;

  // Climate stress
  newState.environment.climateStress +=
    newState.environment.aqi / 100 +
    newState.factory.toxicWaste / 200;

  // Health damage
  if (newState.environment.aqi > 300)
    newState.player.health -= 20;
  else if (newState.environment.aqi > 200)
    newState.player.health -= 10;
  else if (newState.environment.aqi > 150)
    newState.player.health -= 5;

  // Trigger Illegal Dumping Event
  if (
    newState.factory.toxicWaste >= 300 &&
    newState.factory.profitability < 50 &&
    Math.random() < 0.3
  ) {
    newState.activeEvent = "ILLEGAL_DUMPING";
  }

  // Loss conditions
  if (
    newState.environment.waterLevel <= 0 ||
    newState.player.health <= 0 ||
    newState.factory.stability <= 0
  ) {
    newState.meta.gameOver = true;
  }

  return newState;
}

function advanceDayIfNeeded(state) {
  if (state.meta.hoursUsed < HOURS_PER_DAY) return state;

  let newState = applyDayEndEffects(state);
  newState.meta.day += 1;
  newState.meta.hoursUsed = 0;
  newState.meta.workDecisionMade = false;
  newState.player.money -= newState.economy.householdExpense;
  return newState;
}

export function gameReducer(state, action) {
  switch (action.type) {

    case "GO_TO_WORK": {
      const WORK_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + WORK_HOURS;
      if (state.meta.workDecisionMade) return state;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded({
        ...state,
        meta: {
          ...state.meta,
          hoursUsed: nextHoursUsed,
          workDecisionMade: true
        },
        player: {
          ...state.player,
          money: state.player.money + state.economy.dailyWage,
          health: state.player.health - 5,
          jobSecurity: state.player.jobSecurity + 2
        },
        factory: {
          ...state.factory,
          toxicWaste: state.factory.toxicWaste + 10,
          equipmentWear: state.factory.equipmentWear + 2,
          profitability: state.factory.profitability + 2
        },
        environment: {
          ...state.environment,
          aqi: state.environment.aqi + 5
        }
      });
    }

    case "SKIP_WORK": {
      if (state.meta.workDecisionMade) return state;
      return {
        ...state,
        meta: { ...state.meta, workDecisionMade: true },
        player: {
          ...state.player,
          jobSecurity: state.player.jobSecurity - 6,
          health: state.player.health + 2
        },
        society: { ...state.society }
      };
    }

    case "EXTRA_SHIFT": {
      if (!state.meta.workDecisionMade) return state;
      const EXTRA_SHIFT_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + EXTRA_SHIFT_HOURS;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded({
        ...state,
        meta: { ...state.meta, hoursUsed: nextHoursUsed },
        player: {
          ...state.player,
          money: state.player.money + state.economy.dailyWage * 0.75,
          health: state.player.health - 5,
          jobSecurity: state.player.jobSecurity + 5
        },
        factory: {
          ...state.factory,
          toxicWaste: state.factory.toxicWaste + 20,
          equipmentWear: state.factory.equipmentWear + 3,
          profitability: state.factory.profitability + 5
        },
        environment: {
          ...state.environment,
          aqi: state.environment.aqi + 10
        }
      });
    }

    case "SLEEP": {
      if (!state.meta.workDecisionMade) return state;
      const SLEEP_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + SLEEP_HOURS;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded({
        ...state,
        meta: { ...state.meta, hoursUsed: nextHoursUsed },
        player: {
          ...state.player,
          health: state.player.health + 10
        }
      });
    }

    case "UPDATE_WAGE": {
      const js = state.player.jobSecurity;
      let multiplier = 1;

      if (js <= 20) multiplier = 0.5;
      else if (js <= 40) multiplier = 0.8;
      else if (js <= 60) multiplier = 1;
      else if (js <= 80) multiplier = 1.3;
      else multiplier = 1.6;

      return {
        ...state,
        economy: {
          ...state.economy,
          dailyWage: state.economy.baseWage * multiplier
        }
      };
    }

    case "RESOLVE_EVENT":
      return { ...state, activeEvent: null };

    default:
      return state;
  }
}
