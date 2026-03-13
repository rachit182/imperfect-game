import { useMemo } from "react";
import { PixelButton, PixelPanel } from "../ui/components/PixelUI";

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function bandLabel01(v01) {
  if (v01 < 0.33) return "Low";
  if (v01 < 0.66) return "Rising";
  return "High";
}

function formatMoney(n) {
  return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function StatBar({ label, value, max }) {
  const clamped = clamp(value, 0, max);
  const pct = (clamped / max) * 100;

  return (
    <div className="end-stat-row">
      <div className="end-stat-row__head">
        <span>{label}</span>
        <span>{Number(value).toFixed(0)}/{max}</span>
      </div>
      <div className="end-stat-row__track">
        <span className="end-stat-row__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EndScreen({ state, onReturnToDashboard }) {
  const cause = state?.meta?.deathCause || "system collapse";

  const summary = useMemo(() => {
    const health01 = clamp((state.player.health ?? 0) / MAX_LEVELS.health, 0, 1);
    const js01 = clamp((state.player.jobSecurity ?? 0) / MAX_LEVELS.jobSecurity, 0, 1);
    const aqi01 = clamp((state.environment.aqi ?? 0) / MAX_LEVELS.aqi, 0, 1);
    const sea01 = clamp((state.environment.seaWaterLevel ?? 0) / MAX_LEVELS.seaWaterLevel, 0, 1);
    const stress01 = clamp((state.environment.climateStress ?? 0) / MAX_LEVELS.climateStress, 0, 1);
    const tox01 = clamp((state.factory.toxicWaste ?? 0) / MAX_LEVELS.toxicWaste, 0, 1);
    const wear01 = clamp((state.factory.equipmentWear ?? 0) / MAX_LEVELS.equipmentWear, 0, 1);
    const stab01 = clamp((state.factory.stability ?? 0) / MAX_LEVELS.factoryStability, 0, 1);
    const profit01 = clamp((state.factory.profitability ?? 0) / MAX_LEVELS.factoryProfitability, 0, 1);

    return {
      youLine: `Health: ${bandLabel01(health01)} | Job security: ${bandLabel01(js01)}`,
      islandLine: `AQI: ${bandLabel01(aqi01)} | Sea level: ${bandLabel01(sea01)} | Climate: ${bandLabel01(stress01)}`,
      factoryLine: `Waste: ${bandLabel01(tox01)} | Wear: ${bandLabel01(wear01)} | Stability: ${bandLabel01(stab01)} | Profit: ${bandLabel01(profit01)}`
    };
  }, [state]);

  return (
    <div className="screen screen--end screen--end-rich">
      <PixelPanel className="end-overview">
        <p className="start-kicker">Imperfect</p>
        <h2>Game Over</h2>
        <p className="end-overview-sub">You held on, but the system costs eventually won.</p>
        <div className="end-overview-grid">
          <div>
            <span className="end-overview-label">Final Day</span>
            <strong>{state.meta.day}</strong>
          </div>
          <div>
            <span className="end-overview-label">Final Money</span>
            <strong>${formatMoney(state.player.money)}</strong>
          </div>
          <div>
            <span className="end-overview-label">Cause</span>
            <strong>{cause}</strong>
          </div>
        </div>
        <PixelButton onClick={onReturnToDashboard}>Back to Dashboard</PixelButton>
      </PixelPanel>

      <div className="end-detail-grid">
        <PixelPanel className="end-detail-card">
          <h3>You</h3>
          <p className="end-summary-line">{summary.youLine}</p>
          <StatBar label="Health" value={state.player.health} max={MAX_LEVELS.health} />
          <StatBar label="Job Security" value={state.player.jobSecurity} max={MAX_LEVELS.jobSecurity} />
        </PixelPanel>

        <PixelPanel className="end-detail-card">
          <h3>Island</h3>
          <p className="end-summary-line">{summary.islandLine}</p>
          <StatBar label="AQI" value={state.environment.aqi} max={MAX_LEVELS.aqi} />
          <StatBar label="Sea Water" value={state.environment.seaWaterLevel} max={MAX_LEVELS.seaWaterLevel} />
          <StatBar label="Climate Stress" value={state.environment.climateStress} max={MAX_LEVELS.climateStress} />
        </PixelPanel>

        <PixelPanel className="end-detail-card">
          <h3>Factory</h3>
          <p className="end-summary-line">{summary.factoryLine}</p>
          <StatBar label="Stability" value={state.factory.stability} max={MAX_LEVELS.factoryStability} />
          <StatBar label="Profitability" value={state.factory.profitability} max={MAX_LEVELS.factoryProfitability} />
          <StatBar label="Equipment Wear" value={state.factory.equipmentWear} max={MAX_LEVELS.equipmentWear} />
          <StatBar label="Toxic Waste" value={state.factory.toxicWaste} max={MAX_LEVELS.toxicWaste} />
          <StatBar
            label="Treadmill"
            value={state.society.treadmillOfProduction}
            max={MAX_LEVELS.treadmillOfProduction}
          />
        </PixelPanel>
      </div>
    </div>
  );
}
