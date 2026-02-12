export const initialState = {
  meta: {
    day: 1,
    gameOver: false,
    deathCause: null,
    hoursUsed: 0,
    workDecisionMade: false,
    stormVulnerability: false
  },
  player: {
    money: 1000,
    health: 100,
    jobSecurity: 50,
    home: {
      hasConcreteBarrier: false,
      stormProtectionMultiplier: 1
    }
  },
  environment: {
    aqi: 100,
    seaWaterLevel: 100,
    freshGroundWaterLevel: 100,
    climateStress: 0
  },
  factory: {
    stability: 70,
    profitability: 50,
    equipmentWear: 0,
    toxicWaste: 0
  },
  society: {},
  economy: {
    baseWage: 100,
    dailyWage: 100,
    householdExpense: 50
  },
  events: {
    familyIllnessCooldownUntilDay: 0,
    healthWarningCooldownUntilDay: 0
  },
  activeEvent: null
};
