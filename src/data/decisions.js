export const decisions = [
  {
    label: "Take extra shifts at the factory",
    playerEffects: {
      money: +15,
      wellbeing: -10,
      localEnvironment: -5,
      jobSecurity: +5
    },
    systemEffects: {
      environment: -8,
      economy: +6,
      equity: -4
    }
  },

  {
    label: "Skip work to care for family",
    playerEffects: {
      money: -10,
      wellbeing: +10,
      jobSecurity: -8
    },
    systemEffects: {
      economy: -6,
      equity: +3
    }
  },

  {
    label: "Attend a community protest",
    playerEffects: {
      wellbeing: +5,
      jobSecurity: -5
    },
    systemEffects: {
      environment: +6,
      publicSatisfaction: -4
    }
  }
];
