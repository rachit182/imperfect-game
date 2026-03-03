const HOURS_PER_DAY = 24;
const TREADMILL_MIN = 0;
const TREADMILL_MAX = 100;

// NEW: how much the levees reduce sea water level immediately
const HOME_LEVEE_SEA_DROP = 35; // tune this (units are your seaWaterLevel scale: 0..200)

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function applyTreadmillShift(state, shift) {
  return {
    ...state,
    society: {
      ...state.society,
      treadmillOfProduction: clamp(
        (state.society.treadmillOfProduction ?? 0) + shift,
        TREADMILL_MIN,
        TREADMILL_MAX
      )
    }
  };
}

function getEventTreadmillShift(eventId, choiceId) {
  switch (eventId) {
    case "HOME_BUILD_CONFIRM":
      if (choiceId === "CONTINUE") return 4;
      if (choiceId === "LATER") return -1;
      return 0;
    case "ILLEGAL_WASTE_DUMPING":
      if (choiceId === "REPORT") return -6;
      if (choiceId === "SILENT") return 8;
      return 0;
    case "FAMILY_ILLNESS":
      if (choiceId === "PRIVATE_TREATMENT") return -2;
      return 0;
    case "HEALTH_DEGRADATION_WARNING":
      if (choiceId === "VISIT_DOCTOR") return -3;
      if (choiceId === "IGNORE_FOR_NOW") return 2;
      return 0;
    case "SEVERE_STORM":
      if (choiceId === "REBUILD_HIGHER") return 2;
      if (choiceId === "MINIMAL_REPAIR") return 1;
      return 0;
    case "EQUIPMENT_FAILURE":
      if (choiceId === "DEMAND_MAINTENANCE") return -5;
      if (choiceId === "CONTINUE_OPERATIONS") return 7;
      return 0;
    default:
      return 0;
  }
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
    } else if (state.factory.toxicWaste >= 450) {
      state.meta.deathCause = "toxic exposure";
    } else {
      state.meta.deathCause = "chronic disease";
    }
    return state;
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
    newState.environment.seaWaterLevel += 20;
    newState.factory.equipmentWear += 5;
  }

  // 2) Passive penalty: worn equipment continuously worsens AQI.
  newState.environment.aqi += newState.factory.equipmentWear / 10;

  // 3) Update sea water level (faster baseline + stronger climate effect)
  newState.environment.seaWaterLevel +=
    8 + newState.environment.climateStress / 8;

  // 4) Update climate stress
  newState.environment.climateStress +=
    newState.environment.aqi / 100 +
    newState.factory.toxicWaste / 200;

  // 5) Treadmill-of-production pressure
  const treadmillPressure = newState.society.treadmillOfProduction / 100;
  newState.factory.profitability += treadmillPressure * 2;
  newState.environment.aqi += treadmillPressure * 8;
  newState.factory.toxicWaste += treadmillPressure * 10;
  newState.player.health -= treadmillPressure * 2;

  // 6) Apply health damage
  if (newState.environment.aqi >= 300) newState.player.health -= 20;
  else if (newState.environment.aqi >= 200) newState.player.health -= 10;

  // Additional systemic penalties
  if (newState.factory.toxicWaste >= 400) {
    newState.player.money -= 200;
  }
  if (newState.factory.profitability <= 10) {
    newState.factory.stability -= 30;
    newState.player.jobSecurity -= 40;
  }

  // 7) Check event triggers
  newState = checkEventTriggers(newState);

  // 8) Check loss conditions
  return applyLossConditions(newState);
}

function advanceDayIfNeeded(state) {
  if (state.meta.hoursUsed < HOURS_PER_DAY) return state;

  let newState = applyDayEndEffects(state);
  newState.meta.day += 1;
  newState.meta.hoursUsed = 0;
  newState.meta.workDecisionMade = false;
  newState.meta.lastActionType = null;
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

        // HOME becomes sturdier
        newState.player.home.hasConcreteBarrier = true;
        newState.player.home.stormProtectionMultiplier = 0.3;
        newState.meta.stormVulnerability = false;

        // NEW: Levees/barrier reduce effective sea level
        newState.environment.seaWaterLevel = Math.max(
          0,
          newState.environment.seaWaterLevel - HOME_LEVEE_SEA_DROP
        );

        // (optional) upkeep cost stays
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
        newState.environment.climateStress += 5;
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
    "FAMILY_REST_DAY",
    "COMMUNITY_CLEANUP",
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
      return applyTreadmillShift(
        {
          ...state,
          activeEvent: { id: "HOME_BUILD_CONFIRM" },
          meta: { ...state.meta, lastActionType: "REQUEST_BUILD_HOME" }
        },
        1
      );
    }

    case "START_GAME":
      return {
        ...state,
        meta: { ...state.meta, started: true }
      };

    case "GO_TO_WORK": {
      const WORK_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + WORK_HOURS;
      if (state.meta.workDecisionMade) return state;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded(
        applyTreadmillShift(
          {
            ...state,
            meta: {
              ...state.meta,
              hoursUsed: nextHoursUsed,
              workDecisionMade: true,
              lastActionType: "GO_TO_WORK"
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
          },
          6
        )
      );
    }

    case "FAMILY_REST_DAY": {
      const REST_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + REST_HOURS;
      const followUpAfterSkip =
        state.meta.workDecisionMade && state.meta.lastActionType === "SKIP_WORK";
      if (state.meta.workDecisionMade && !followUpAfterSkip) return state;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded(
        applyTreadmillShift(
          {
            ...state,
            meta: {
              ...state.meta,
              hoursUsed: nextHoursUsed,
              workDecisionMade: true,
              lastActionType: "FAMILY_REST_DAY"
            },
            player: {
              ...state.player,
              health: state.player.health + 12,
              jobSecurity: state.player.jobSecurity - 8
            }
          },
          -6
        )
      );
    }

    case "COMMUNITY_CLEANUP": {
      const CLEANUP_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + CLEANUP_HOURS;
      const followUpAfterSkip =
        state.meta.workDecisionMade && state.meta.lastActionType === "SKIP_WORK";
      if (state.meta.workDecisionMade && !followUpAfterSkip) return state;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded(
        applyTreadmillShift(
          {
            ...state,
            meta: {
              ...state.meta,
              hoursUsed: nextHoursUsed,
              workDecisionMade: true,
              lastActionType: "COMMUNITY_CLEANUP"
            },
            player: {
              ...state.player,
              money: state.player.money - 50
            },
            factory: {
              ...state.factory,
              toxicWaste: state.factory.toxicWaste - 35
            },
            environment: {
              ...state.environment,
              aqi: state.environment.aqi - 15
            }
          },
          -7
        )
      );
    }

    case "SKIP_WORK":
      if (state.meta.workDecisionMade) return state;
      return applyTreadmillShift(
        {
          ...state,
          meta: {
            ...state.meta,
            workDecisionMade: true,
            lastActionType: "SKIP_WORK"
          },
          player: {
            ...state.player,
            jobSecurity: state.player.jobSecurity - 6,
            health: state.player.health + 2
          }
        },
        -4
      );

    case "EXTRA_SHIFT": {
      if (!state.meta.workDecisionMade) return state;
      const EXTRA_SHIFT_HOURS = 8;
      const nextHoursUsed = state.meta.hoursUsed + EXTRA_SHIFT_HOURS;
      if (nextHoursUsed > HOURS_PER_DAY) return state;

      return advanceDayIfNeeded(
        applyTreadmillShift(
          {
            ...state,
            meta: {
              ...state.meta,
              hoursUsed: nextHoursUsed,
              lastActionType: "EXTRA_SHIFT"
            },
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
          },
          9
        )
      );
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

      const dayAdvanced = nextState.meta.day > state.meta.day;
      const baselineMoneyAfterSleep =
        state.player.money -
        (dayAdvanced ? nextState.economy.householdExpense : 0);

      return applyTreadmillShift(
        {
          ...nextState,
          meta: { ...nextState.meta, lastActionType: "SLEEP" },
          player: {
            ...nextState.player,
            money: Math.min(nextState.player.money, baselineMoneyAfterSleep)
          }
        },
        -2
      );
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

      const eventId = state.activeEvent.id;
      const choiceId = action.payload?.choiceId;
      if (!choiceId) return { ...state, activeEvent: null };

      const resolvedState = applyEventChoice(state, eventId, choiceId);
      const treadmillShift = getEventTreadmillShift(eventId, choiceId);
      return applyTreadmillShift(
        { ...resolvedState, activeEvent: null },
        treadmillShift
      );
    }

    default:
      return state;
  }
}