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

function formatWithMax(value, max, decimals = 0) {
  return `${Number(value).toFixed(decimals)}/${max}`;
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function badgeFrom(value01) {
  if (value01 >= 0.75) return { text: "High", className: "badge danger" };
  if (value01 >= 0.45) return { text: "Rising", className: "badge warn" };
  return { text: "Low", className: "badge ok" };
}

function Metric({ label, value, max, decimals = 0 }) {
  const safeMax = max ?? 100;
  const clampedValue = clamp(Number(value) || 0, 0, safeMax);
  const value01 = safeMax === 0 ? 0 : clampedValue / safeMax;

  return (
    <div className="end-metric">
      <div className="end-metric-head">
        <span className="end-metric-label">{label}</span>
        <span className="end-metric-value">{formatWithMax(value, safeMax, decimals)}</span>
      </div>
      <div className="end-meter">
        <div className="end-meter-fill" style={{ width: `${value01 * 100}%` }} />
      </div>
    </div>
  );
}

export default function EndScreen({ state, onRestart }) {
  const death = state?.meta?.deathCause || "unknown causes";

  const sea01 = clamp(
    (state?.environment?.seaWaterLevel ?? 0) / MAX_LEVELS.seaWaterLevel,
    0,
    1
  );
  const aqi01 = clamp((state?.environment?.aqi ?? 0) / MAX_LEVELS.aqi, 0, 1);
  const tox01 = clamp((state?.factory?.toxicWaste ?? 0) / MAX_LEVELS.toxicWaste, 0, 1);

  const seaBadge = badgeFrom(sea01);
  const aqiBadge = badgeFrom(aqi01);
  const toxBadge = badgeFrom(tox01);

  return (
    <div className="end-screen">
      <div className="end-card">
        <div className="end-top">
          <div>
            <h1 className="end-title">Game Over</h1>
            <p className="end-subtitle">
              You kept going until the costs caught up.
            </p>
          </div>

          <div className="end-actions">
            <button
              className="end-button"
              onClick={() => {
                if (typeof onRestart === "function") onRestart();
                else window.location.reload(); // fallback if you don’t wire up RESET yet
              }}
            >
              Restart
            </button>
          </div>
        </div>

        <div className="end-hero">
          <div className="end-kpi">
            <div className="end-kpi-label">Final Day</div>
            <div className="end-kpi-value">{state.meta.day}</div>
          </div>

          <div className="end-kpi">
            <div className="end-kpi-label">Final Money</div>
            <div className="end-kpi-value">${formatMoney(state.player.money)}</div>
          </div>

          <div className="end-kpi end-kpi-wide">
            <div className="end-kpi-label">Cause</div>
            <div className="end-kpi-value end-kpi-cause">Severe {death}</div>
          </div>
        </div>

        <div className="end-grid">
          {/* YOU */}
          <section className="end-panel">
            <div className="end-panel-head">
              <h2 className="end-panel-title">You</h2>
              <p className="end-panel-desc">What you protected — and what slipped.</p>
            </div>

            <Metric label="Health" value={state.player.health} max={MAX_LEVELS.health} />
            <Metric label="Job Security" value={state.player.jobSecurity} max={MAX_LEVELS.jobSecurity} />
          </section>

          {/* ISLAND */}
          <section className="end-panel">
            <div className="end-panel-head">
              <h2 className="end-panel-title">Island</h2>
              <p className="end-panel-desc">The world you shaped around you.</p>
            </div>

            <div className="end-badges">
              <span className={aqiBadge.className}>AQI: {aqiBadge.text}</span>
              <span className={seaBadge.className}>Sea Level: {seaBadge.text}</span>
              <span className={toxBadge.className}>Toxic Waste: {toxBadge.text}</span>
            </div>

            <Metric label="AQI" value={state.environment.aqi} max={MAX_LEVELS.aqi} />
            <Metric label="Sea Water Level" value={state.environment.seaWaterLevel} max={MAX_LEVELS.seaWaterLevel} decimals={2} />
            <Metric label="Climate Stress" value={state.environment.climateStress} max={MAX_LEVELS.climateStress} decimals={2} />
          </section>

          {/* FACTORY SNAPSHOT */}
          <section className="end-panel end-panel-wide">
            <div className="end-panel-head">
              <h2 className="end-panel-title">Factory Snapshot</h2>
              <p className="end-panel-desc">Production kept you afloat — at a cost.</p>
            </div>

            <div className="end-factory-grid">
              <Metric label="Stability" value={state.factory.stability} max={MAX_LEVELS.factoryStability} />
              <Metric label="Profitability" value={state.factory.profitability} max={MAX_LEVELS.factoryProfitability} />
              <Metric label="Equipment Wear" value={state.factory.equipmentWear} max={MAX_LEVELS.equipmentWear} />
              <Metric label="Toxic Waste" value={state.factory.toxicWaste} max={MAX_LEVELS.toxicWaste} />
              <Metric label="Treadmill Of Production" value={state.society.treadmillOfProduction} max={MAX_LEVELS.treadmillOfProduction} />
            </div>
          </section>
        </div>

        <p className="end-footer">
          Tip: small wins add up — so do the hidden costs.
        </p>
      </div>
    </div>
  );
}