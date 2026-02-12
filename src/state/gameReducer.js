const HOURS_PER_DAY = 24;

function cloneState(state) {
  return {
    ...state,
    meta: { ...state.meta },
    player: {
      ...state.player,
      home: { ...state.player.home }
    },
    environment: { ...state.environment },
    factory: { ...state.factory },
    society: { ...state.society },
    economy: { ...state.economy }
  };
}

function checkEventTriggers(state) {
  if (state.activeEvent) return state;

  if (
    state.factory.toxicWaste >= 300 &&
    state.factory.profitability < 50 &&
    Math.random() < 0.3
  ) {
    return { ...state, activeEvent: { id: "ILLEGAL_WASTE_DUMPING" } };
  }

  if (state.environment.waterLevel <= 40 && state.factory.toxicWaste >= 400) {
    return { ...state, activeEvent: { id: "WATER_TABLE_COLLAPSE_WARNING" } };
  }

  if (state.environment.aqi >= 180 && state.player.health <= 70) {
    return { ...state, activeEvent: { id: "FAMILY_ILLNESS" } };
  }

  if (state.environment.climateStress >= 60 && Math.random() < 0.4) {
    return { ...state, activeEvent: { id: "SEVERE_STORM" } };
  }

  if (state.factory.equipmentWear >= 70) {
    return { ...state, activeEvent: { id: "EQUIPMENT_FAILURE" } };
  }

  return state;
}

function applyDayEndEffects(state) {
  let newState = cloneState(state);

  // 1) Apply production effects
  if (newState.factory.stability >= 60) {
    newState.player.money += 300;
    newState.environment.aqi += 20;
    newState.factory.toxicWaste += 50;
    newState.environment.waterLevel -= 5;
    newState.factory.equipmentWear += 5;
  }

  // 2) Update AQI & toxic waste (already represented by direct action + production)

  // 3) Update water level
  newState.environment.waterLevel -= 2;

  // 4) Update climate stress
  newState.environment.climateStress +=
    newState.environment.aqi / 100 +
    newState.factory.toxicWaste / 200;

  // 5) Apply health damage
  if (newState.environment.aqi >= 300) newState.player.health -= 20;
  else if (newState.environment.aqi >= 200) newState.player.health -= 10;

  // Additional systemic penalties
  if (newState.environment.waterLevel <= 20) newState.player.money -= 200;
  if (newState.factory.profitability <= 10) {
    newState.factory.stability -= 30;
    newState.player.jobSecurity -= 40;
  }

  // 6) Check event triggers
  newState = checkEventTriggers(newState);

  // 7) Check loss conditions
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

function applyEventChoice(state, eventId, choiceId) {
  const newState = cloneState(state);

  switch (eventId) {
    case "ILLEGAL_WASTE_DUMPING":
      if (choiceId === "REPORT") {
        newState.player.jobSecurity -= 30;
        newState.player.money -= 200;
        newState.factory.toxicWaste -= 150;
        newState.factory.profitability -= 20;
        newState.factory.stability -= 10;
      } else if (choiceId === "SILENT") {
        newState.player.jobSecurity += 5;
        newState.player.money += 100;
        newState.factory.toxicWaste += 100;
        newState.environment.waterLevel -= 5;
        newState.environment.climateStress += 5;
      }
      break;

    case "WATER_TABLE_COLLAPSE_WARNING":
      if (choiceId === "RESTRICT") {
        newState.factory.stability -= 15;
        newState.player.money -= 100;
        newState.environment.waterLevel += 10;
        newState.factory.profitability -= 10;
      } else if (choiceId === "IGNORE") {
        newState.factory.stability += 5;
        newState.environment.waterLevel -= 15;
        newState.factory.toxicWaste += 50;
        newState.environment.climateStress += 10;
      }
      break;

    case "FAMILY_ILLNESS":
      if (choiceId === "PRIVATE_TREATMENT") {
        newState.player.money -= 500;
        newState.player.health += 20;
      }
      break;

    case "SEVERE_STORM":
      if (choiceId === "REBUILD_HIGHER") {
        newState.player.money -= 800;
        newState.player.home.hasConcreteBarrier = true;
        newState.player.home.stormProtectionMultiplier = 0.3;
        newState.meta.stormVulnerability = false;
      } else if (choiceId === "MINIMAL_REPAIR") {
        newState.player.money -= 200;
        newState.meta.stormVulnerability = true;
      }
      break;

    case "EQUIPMENT_FAILURE":
      if (choiceId === "DEMAND_MAINTENANCE") {
        newState.player.jobSecurity -= 10;
        newState.factory.equipmentWear -= 40;
        newState.factory.profitability -= 15;
        newState.environment.aqi -= 20;
      } else if (choiceId === "CONTINUE_OPERATIONS") {
        newState.player.jobSecurity += 5;
        newState.factory.equipmentWear += 20;
        newState.environment.aqi += 30;
        newState.factory.toxicWaste += 80;
      }
      break;

    default:
      break;
  }

  if (
    newState.environment.waterLevel <= 0 ||
    newState.player.health <= 0 ||
    newState.factory.stability <= 0
  ) {
    newState.meta.gameOver = true;
  }

  return newState;
}

function isBlockedByEvent(state, actionType) {
  if (!state.activeEvent) return false;

  return [
    "GO_TO_WORK",
    "SKIP_WORK",
    "EXTRA_SHIFT",
    "SLEEP"
  ].includes(actionType);
}

export function gameReducer(state, action) {
  if (isBlockedByEvent(state, action.type)) return state;

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

    case "SKIP_WORK":
      if (state.meta.workDecisionMade) return state;
      return {
        ...state,
        meta: { ...state.meta, workDecisionMade: true },
        player: {
          ...state.player,
          jobSecurity: state.player.jobSecurity - 6,
          health: state.player.health + 2
        }
      };

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

      const nextState = advanceDayIfNeeded({
        ...state,
        meta: { ...state.meta, hoursUsed: nextHoursUsed },
        player: {
          ...state.player,
          health: state.player.health + 10
        }
      });

      // Sleep should not directly alter money, but day rollover costs/income still apply.
      if (nextState.meta.day === state.meta.day) {
        return {
          ...nextState,
          player: {
            ...nextState.player,
            money: state.player.money
          }
        };
      }

      return nextState;
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

    case "RESOLVE_EVENT": {
      if (!state.activeEvent) return state;

      const choiceId = action.payload?.choiceId;
      if (!choiceId) return { ...state, activeEvent: null };

      const resolvedState = applyEventChoice(
        state,
        state.activeEvent.id,
        choiceId
      );
      return { ...resolvedState, activeEvent: null };
    }

    default:
      return state;
  }
}
