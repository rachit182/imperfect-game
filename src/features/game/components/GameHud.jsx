import { useContext, useEffect } from "react";
import { GameContext } from "../state/GameContext";
import IslandScene from "./IslandScene";
import { MetricBar, PixelPanel, TooltipTrigger } from "../../../ui/components/PixelUI";
import {
  ExpenseIcon,
  FactoryIcon,
  HeartIcon,
  IncomeIcon,
  SmogIcon,
  WavesIcon,
  WorkerIcon
} from "../../../ui/icons/GameIcons";

const MAX_LEVELS = {
  health: 100,
  jobSecurity: 100,
  aqi: 500,
  seaWaterLevel: 200,
  treadmillOfProduction: 100
};

const METRIC_DESCRIPTIONS = {
  Health: "Your physical condition. If it gets too low, you die.",
  "Job Security": "How stable your job is. Lower security means higher layoff risk.",
  AQI: "Air quality index. Higher AQI means worse air and more health damage.",
  "Sea Water Level": "How much the sea has risen around the island.",
  "Treadmill Of Production":
    "Higher treadmill means stronger pressure to keep production growing."
};

export default function GameHud() {
  const { state, dispatch } = useContext(GameContext);

  useEffect(() => {
    dispatch({ type: "UPDATE_WAGE" });
  }, [dispatch, state.player.jobSecurity]);

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
    <div className="game-stage">
      <div className="island is-full">
        <IslandScene
          waterLevel={water01}
          fortified={Boolean(state.player.home.hasConcreteBarrier)}
        />
      </div>

      <PixelPanel className="hud-panel hud-panel--time">
        <p className="hud-day">Day {state.meta.day}</p>
        <div className={`clock-face ${isLightClock ? "clock-face--am" : "clock-face--pm"}`}>
          <span className="clock-mark clock-mark--12" />
          <span className="clock-mark clock-mark--3" />
          <span className="clock-mark clock-mark--6" />
          <span className="clock-mark clock-mark--9" />
          <span
            className="clock-hand clock-hand--hour"
            style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
          />
          <span
            className="clock-hand clock-hand--minute"
            style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
          />
          <span className="clock-center" />
        </div>
        <div className="econ-stack">
          <div className="econ-row">
            <ExpenseIcon />
            <span>${state.economy.householdExpense}</span>
            <TooltipTrigger
              label="Daily Household Expenditure"
              description="Daily essential spending needed by your household."
              ariaLabel="Daily household expenditure info"
            />
          </div>
          <div className="econ-row">
            <IncomeIcon />
            <span>${state.economy.dailyWage}</span>
            <TooltipTrigger
              label="Daily Wage"
              description="Income you currently earn for a standard workday."
              ariaLabel="Daily wage info"
            />
          </div>
        </div>
      </PixelPanel>

      <PixelPanel className="hud-panel hud-panel--money">
        <div className="money-display-wrap">
          <span className="money-label">Total Money</span>
          <p className="money-value">${state.player.money}</p>
          <TooltipTrigger
            label="Money"
            description="Total cash currently available for decisions and events."
            ariaLabel="Money info"
          />
        </div>
      </PixelPanel>

      <PixelPanel className="hud-panel hud-panel--top-left">
        <MetricBar
          icon={<HeartIcon />}
          label="Health"
          description={METRIC_DESCRIPTIONS.Health}
          value={state.player.health}
          max={MAX_LEVELS.health}
        />
        <MetricBar
          icon={<WorkerIcon />}
          label="Job Security"
          description={METRIC_DESCRIPTIONS["Job Security"]}
          value={state.player.jobSecurity}
          max={MAX_LEVELS.jobSecurity}
        />
      </PixelPanel>

      <PixelPanel className="hud-panel hud-panel--bottom-left">
        <MetricBar
          icon={<SmogIcon />}
          label="AQI"
          description={METRIC_DESCRIPTIONS.AQI}
          value={state.environment.aqi}
          max={MAX_LEVELS.aqi}
        />
        <MetricBar
          icon={<WavesIcon />}
          label="Sea Water Level"
          description={METRIC_DESCRIPTIONS["Sea Water Level"]}
          value={state.environment.seaWaterLevel}
          max={MAX_LEVELS.seaWaterLevel}
        />
      </PixelPanel>

      <PixelPanel className="hud-panel hud-panel--bottom-right">
        <MetricBar
          icon={<FactoryIcon />}
          label="Treadmill Of Production"
          description={METRIC_DESCRIPTIONS["Treadmill Of Production"]}
          value={state.society.treadmillOfProduction}
          max={MAX_LEVELS.treadmillOfProduction}
        />
      </PixelPanel>
    </div>
  );
}
