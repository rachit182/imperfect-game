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
    economy: { ...state.economy },
    events: { ...state.events }
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

  if (
    state.environment.freshGroundWaterLevel <= 40 &&
    state.factory.toxicWaste >= 400
  ) {
    return { ...state, activeEvent: { id: "WATER_TABLE_COLLAPSE_WARNING" } };
  }

  if (
    state.environment.aqi > 280 &&
    state.player.health < 20 &&
    state.meta.day >= state.events.familyIllnessCooldownUntilDay
  ) {
    return { ...state, activeEvent: { id: "FAMILY_ILLNESS" } };
  }

  if (
    state.player.health < 40 &&
    state.meta.day >= state.events.healthWarningCooldownUntilDay
  ) {
    return { ...state, activeEvent: { id: "HEALTH_DEGRADATION_WARNING" } };
  }

  if (state.environment.climateStress >= 60 && Math.random() < 0.4) {
    return { ...state, activeEvent: { id: "SEVERE_STORM" } };
  }

  if (state.factory.equipmentWear >= 70) {
    return { ...state, activeEvent: { id: "EQUIPMENT_FAILURE" } };
  }

  return state;
}

function applyLossConditions(state) {
  if (state.player.health <= 0) {
    state.meta.gameOver = true;
    if (state.environment.aqi >= 300) {
      state.meta.deathCause = "severe respiratory disease";
    } else if (state.environment.freshGroundWaterLevel <= 20) {
      state.meta.deathCause = "water-borne disease";
    } else {
      state.meta.deathCause = "chronic disease";
    }
    return state;
  }

  if (state.environment.freshGroundWaterLevel <= 0) {
    state.meta.gameOver = true;
  }

  if (state.factory.stability <= 0) {
    state.meta.gameOver = true;
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
    newState.environment.freshGroundWaterLevel -= 5;
    newState.environment.seaWaterLevel += 1;
    newState.factory.equipmentWear += 5;
  }

  // 2) Update AQI & toxic waste (already represented by direct action + production)
  // Passive penalty: worn equipment continuously worsens AQI.
  newState.environment.aqi += newState.factory.equipmentWear / 10;

  // 3) Update water level
  newState.environment.freshGroundWaterLevel -= 2;
  newState.environment.seaWaterLevel += newState.environment.climateStress / 200;

  // 4) Update climate stress
  newState.environment.climateStress +=
    newState.environment.aqi / 100 +
    newState.factory.toxicWaste / 200;

  // 5) Apply health damage
  if (newState.environment.aqi >= 300) newState.player.health -= 20;
  else if (newState.environment.aqi >= 200) newState.player.health -= 10;

  // Additional systemic penalties
  if (newState.environment.freshGroundWaterLevel <= 20) {
    newState.player.money -= 200;
  }
  if (newState.factory.profitability <= 10) {
    newState.factory.stability -= 30;
    newState.player.jobSecurity -= 40;
  }

  // 6) Check event triggers
  newState = checkEventTriggers(newState);

  // 7) Check loss conditions
  return applyLossConditions(newState);
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
    case "HOME_BUILD_CONFIRM":
      if (choiceId === "CONTINUE") {
        if (newState.player.home.hasConcreteBarrier) break;
        if (newState.player.money < 1600) break;

        newState.player.money -= 1600;
        newState.player.home.hasConcreteBarrier = true;
        newState.player.home.stormProtectionMultiplier = 0.3;
        newState.meta.stormVulnerability = false;
        newState.economy.householdExpense = Math.max(
          newState.economy.householdExpense,
          130
        );
      }
      break;

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
        newState.environment.freshGroundWaterLevel -= 5;
        newState.environment.climateStress += 5;
      }
      break;

    case "WATER_TABLE_COLLAPSE_WARNING":
      if (choiceId === "RESTRICT") {
        newState.factory.stability -= 15;
        newState.player.money -= 100;
        newState.environment.freshGroundWaterLevel += 10;
        newState.factory.profitability -= 10;
      } else if (choiceId === "IGNORE") {
        newState.factory.stability += 5;
        newState.environment.freshGroundWaterLevel -= 15;
        newState.factory.toxicWaste += 50;
        newState.environment.climateStress += 10;
      }
      break;

    case "FAMILY_ILLNESS":
      if (choiceId === "PRIVATE_TREATMENT") {
        newState.player.money -= 500;
        newState.player.health += 20;
        newState.events.familyIllnessCooldownUntilDay = newState.meta.day + 3;
      }
      break;

    case "HEALTH_DEGRADATION_WARNING":
      if (choiceId === "VISIT_DOCTOR") {
        if (newState.player.money < 200) break;
        newState.player.money -= 200;
        newState.player.health += 15;
      }
      newState.events.healthWarningCooldownUntilDay = newState.meta.day + 2;
      break;

    case "SEVERE_STORM":
      if (choiceId === "REBUILD_HIGHER") {
        newState.player.money -= 800;
        newState.player.home.hasConcreteBarrier = true;
        newState.player.home.stormProtectionMultiplier = 0.3;
        newState.meta.stormVulnerability = false;
        newState.economy.householdExpense = Math.max(
          newState.economy.householdExpense,
          130
        );
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

  return applyLossConditions(newState);
}

function isBlockedByEvent(state, actionType) {
  if (!state.activeEvent) return false;

  return [
    "REQUEST_BUILD_HOME",
    "GO_TO_WORK",
    "SKIP_WORK",
    "EXTRA_SHIFT",
    "SLEEP"
  ].includes(actionType);
}

export function gameReducer(state, action) {
  if (state.meta.gameOver) return state;
  if (isBlockedByEvent(state, action.type)) return state;

  switch (action.type) {
    case "REQUEST_BUILD_HOME": {
      if (state.player.home.hasConcreteBarrier) return state;
      return { ...state, activeEvent: { id: "HOME_BUILD_CONFIRM" } };
    }

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
      const dayAdvanced = nextState.meta.day > state.meta.day;
      const baselineMoneyAfterSleep =
        state.player.money -
        (dayAdvanced ? nextState.economy.householdExpense : 0);

      return {
        ...nextState,
        player: {
          ...nextState.player,
          // Sleeping can keep or reduce money, but never increase it.
          money: Math.min(nextState.player.money, baselineMoneyAfterSleep)
        }
      };
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
