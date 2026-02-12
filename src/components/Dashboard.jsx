import { useContext, useEffect } from "react";
import { GameContext } from "../state/GameContext";

const MAX_LEVELS = {
  health: 100,
  jobSecurity: 100,
  aqi: 500,
  seaWaterLevel: 200,
  freshGroundWaterLevel: 100,
  climateStress: 100,
  toxicWaste: 500,
  equipmentWear: 100,
  factoryStability: 100,
  factoryProfitability: 100
};

export default function Dashboard() {
  const { state, dispatch } = useContext(GameContext);
  const formatTimeFromStart = (hoursFromStart) => {
    const startHour24 = 9; // 9:00 AM
    const hour24 = (startHour24 + hoursFromStart) % 24;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:00 ${period}`;
  };
  const formatWithMax = (value, max, decimals = 0) =>
    `${Number(value).toFixed(decimals)}/${max}`;
  const renderMetricBar = (label, value, max, decimals = 0) => {
    const clampedValue = Math.max(0, Math.min(value, max));
    return (
      <div className="metric-row">
        <div className="metric-head">
          <span>{label}</span>
          <span>{formatWithMax(value, max, decimals)}</span>
        </div>
        <progress className="metric-bar" value={clampedValue} max={max} />
      </div>
    );
  };

  useEffect(() => {
    dispatch({ type: "UPDATE_WAGE" });
  }, [state.player.jobSecurity]);

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <div className="dashboard-group">
          <p>Day: {state.meta.day}</p>
          <p>Time: {formatTimeFromStart(state.meta.hoursUsed)}</p>
        </div>

        <div className="dashboard-group">
          <p>Daily Household Expenditure: ${state.economy.householdExpense}</p>
          <p>Daily Wage: ${state.economy.dailyWage}</p>
        </div>

        <div className="dashboard-group">
          <p>Money: ${state.player.money}</p>
          {renderMetricBar("Health", state.player.health, MAX_LEVELS.health)}
          {renderMetricBar(
            "Job Security",
            state.player.jobSecurity,
            MAX_LEVELS.jobSecurity
          )}
        </div>

        <div className="dashboard-group">
          {renderMetricBar("AQI", state.environment.aqi, MAX_LEVELS.aqi)}
          {renderMetricBar(
            "Sea Water Level",
            state.environment.seaWaterLevel,
            MAX_LEVELS.seaWaterLevel,
            2
          )}
          {renderMetricBar(
            "Fresh Ground Water Level",
            state.environment.freshGroundWaterLevel,
            MAX_LEVELS.freshGroundWaterLevel,
            2
          )}
        </div>
      </div>

      <div className="dashboard-group hidden-group">
        <p>Hidden Variables</p>

        <div className="hidden-subgroup">
          <p className="hidden-subgroup-title">Meta</p>
          <p>Work Decision Made: {state.meta.workDecisionMade ? "Yes" : "No"}</p>
          <p>Game Over: {state.meta.gameOver ? "Yes" : "No"}</p>
          <p>Active Event: {state.activeEvent ? state.activeEvent.id : "None"}</p>
        </div>

        <div className="hidden-subgroup">
          <p className="hidden-subgroup-title">Environment</p>
          {renderMetricBar(
            "Climate Stress",
            state.environment.climateStress,
            MAX_LEVELS.climateStress,
            2
          )}
        </div>

        <div className="hidden-subgroup">
          <p className="hidden-subgroup-title">Factory</p>
          {renderMetricBar(
            "Toxic Waste",
            state.factory.toxicWaste,
            MAX_LEVELS.toxicWaste
          )}
          {renderMetricBar(
            "Equipment Wear",
            state.factory.equipmentWear,
            MAX_LEVELS.equipmentWear
          )}
          {renderMetricBar(
            "Factory Stability",
            state.factory.stability,
            MAX_LEVELS.factoryStability
          )}
          {renderMetricBar(
            "Factory Profitability",
            state.factory.profitability,
            MAX_LEVELS.factoryProfitability
          )}
        </div>

        <div className="hidden-subgroup">
          <p className="hidden-subgroup-title">Economy</p>
          <p>Base Wage: ${state.economy.baseWage}</p>
        </div>

        <div className="hidden-subgroup">
          <p className="hidden-subgroup-title">Home</p>
          <p>Storm Vulnerability: {state.meta.stormVulnerability ? "Yes" : "No"}</p>
          <p>
            Home Protection Multiplier: {state.player.home.stormProtectionMultiplier}
          </p>
          <p>
            Has Concrete Barrier: {state.player.home.hasConcreteBarrier ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
