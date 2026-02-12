export const initialState = {
  meta: {
    day: 1,
    gameOver: false,
    hoursUsed: 0,
    workDecisionMade: false
  },
  player: {
    money: 1000,
    health: 100,
    jobSecurity: 50,
    home: { hasConcreteBarrier: false, stormProtectionMultiplier: 1 }
  },
  environment: { aqi: 100, waterLevel: 100, climateStress: 0 },
  factory: {
    stability: 70,
    profitability: 50,
    equipmentWear: 0,
    toxicWaste: 0
  },
  society: {},
  economy: { baseWage: 100, dailyWage: 100, householdExpense: 120 },
  activeEvent: null
};
