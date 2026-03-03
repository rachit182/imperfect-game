import { useContext, useEffect } from "react";
import { GameContext } from "../state/GameContext";
import IslandScene from "./IslandScene";

const MAX_LEVELS = {
  health: 100,
  jobSecurity: 100,
  aqi: 500,
  seaWaterLevel: 200,
  climateStress: 100,
  toxicWaste: 500,
  treadmillOfProduction: 100,
  equipmentWear: 100,
  factoryStability: 100,
  factoryProfitability: 100
};

export default function Dashboard() {
  const { state, dispatch } = useContext(GameContext);

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

  // map seaWaterLevel (0..200) into 0..1 for IslandScene overlay
  const water01 = Math.max(
    0,
    Math.min(1, state.environment.seaWaterLevel / MAX_LEVELS.seaWaterLevel)
  );
  const currentHour24 = (9 + state.meta.hoursUsed) % 24;
  const totalHoursElapsed = (state.meta.day - 1) * 24 + 9 + state.meta.hoursUsed;
  const hourRotation = totalHoursElapsed * 30;
  const minuteRotation = totalHoursElapsed * 360;
  const isLightClock = currentHour24 >= 6 && currentHour24 < 18;

  return (
    <div className="dashboard fullscreen-dashboard">
      <div className="island island-full">
        <IslandScene waterLevel={water01} />
      </div>

      <div className="dashboard-group day-time-overlay">
        <p>Day {state.meta.day}</p>
        <div className={`clock-face ${isLightClock ? "clock-am" : "clock-pm"}`} aria-label="In-game clock">
          <span className="clock-mark mark-12" />
          <span className="clock-mark mark-3" />
          <span className="clock-mark mark-6" />
          <span className="clock-mark mark-9" />
          <span
            className="clock-hand hour-hand"
            style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
          />
          <span
            className="clock-hand minute-hand"
            style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
          />
          <span className="clock-center" />
        </div>
      </div>

      <div className="dashboard-main hud-corner">
        <div className="dashboard-group">
          <p>Daily Household Expenditure: ${state.economy.householdExpense}</p>
          <p>Daily Wage: ${state.economy.dailyWage}</p>
        </div>

        <div className="dashboard-group">
          <p>Money: ${state.player.money}</p>
          {renderMetricBar("Health", state.player.health, MAX_LEVELS.health)}
          {renderMetricBar("Job Security", state.player.jobSecurity, MAX_LEVELS.jobSecurity)}
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
            "Treadmill Of Production",
            state.society.treadmillOfProduction,
            MAX_LEVELS.treadmillOfProduction
          )}
          <p>
            Higher treadmill means stronger pressure to keep production growing.
            You usually earn more short-term, but pollution and health risks rise.
          </p>
        </div>
        {/* ISLAND PANEL (this is what you were missing) */}
        <div className="island">
          <IslandScene
            waterLevel={water01}
            fortified={state.player.home.hasConcreteBarrier}
          />
        </div>
      </div>

    </div>
  );
}
