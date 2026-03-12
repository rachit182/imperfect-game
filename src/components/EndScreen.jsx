import React, { useMemo, useState } from "react";

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
  const x = Number(n ?? 0);
  return x.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function EndScreen({ state, onRestart }) {
  const [flipped, setFlipped] = useState({
    you: false,
    island: false,
    factory: false
  });

  const toggle = (key) =>
    setFlipped((p) => ({
      ...p,
      [key]: !p[key]
    }));

  const cause = state?.meta?.deathCause || "unknown cause";

  const summary = useMemo(() => {
    const health01 = clamp((state.player.health ?? 0) / MAX_LEVELS.health, 0, 1);
    const js01 = clamp(
      (state.player.jobSecurity ?? 0) / MAX_LEVELS.jobSecurity,
      0,
      1
    );

    const aqi01 = clamp((state.environment.aqi ?? 0) / MAX_LEVELS.aqi, 0, 1);
    const sea01 = clamp(
      (state.environment.seaWaterLevel ?? 0) / MAX_LEVELS.seaWaterLevel,
      0,
      1
    );
    const stress01 = clamp(
      (state.environment.climateStress ?? 0) / MAX_LEVELS.climateStress,
      0,
      1
    );

    const tox01 = clamp((state.factory.toxicWaste ?? 0) / MAX_LEVELS.toxicWaste, 0, 1);
    const wear01 = clamp(
      (state.factory.equipmentWear ?? 0) / MAX_LEVELS.equipmentWear,
      0,
      1
    );
    const stab01 = clamp(
      (state.factory.stability ?? 0) / MAX_LEVELS.factoryStability,
      0,
      1
    );
    const profit01 = clamp(
      (state.factory.profitability ?? 0) / MAX_LEVELS.factoryProfitability,
      0,
      1
    );

    return {
      youLine: `Health: ${bandLabel01(health01)} • Job security: ${bandLabel01(js01)}`,
      islandLine: `AQI: ${bandLabel01(aqi01)} • Sea level: ${bandLabel01(sea01)} • Climate: ${bandLabel01(stress01)}`,
      factoryLine: `Toxic waste: ${bandLabel01(tox01)} • Wear: ${bandLabel01(wear01)} • Stability: ${bandLabel01(stab01)} • Profit: ${bandLabel01(profit01)}`
    };
  }, [state]);

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

  return (
    <div className="end-screen">
      <header className="end-hero">
        <div className="end-kicker">Imperfect</div>
        <h1 className="end-title">Game Over</h1>
        <p className="end-subtitle">You kept going until the costs caught up.</p>

        <div className="end-actions">
          <button
            className="end-primary-btn"
            onClick={() => (onRestart ? onRestart() : window.location.reload())}
          >
            Restart
          </button>

          <div className="end-stats">
            <div className="end-stat">
              <div className="end-stat-label">Final Day</div>
              <div className="end-stat-value">{state.meta.day}</div>
            </div>
            <div className="end-stat">
              <div className="end-stat-label">Final Money</div>
              <div className="end-stat-value">${formatMoney(state.player.money)}</div>
            </div>
            <div className="end-stat">
              <div className="end-stat-label">Cause</div>
              <div className="end-stat-value">{cause}</div>
            </div>
          </div>
        </div>
      </header>

      <section className="flip-grid">
        {/* YOU */}
        <FlipCard
          title="You"
          subtitle="What you protected — and what slipped."
          summaryLine={summary.youLine}
          flipped={flipped.you}
          onToggle={() => toggle("you")}
          frontContent={
            <>
              <div className="card-badges">
                <Badge label={`Health: ${Math.round(state.player.health)}/${MAX_LEVELS.health}`} />
                <Badge label={`Job: ${Math.round(state.player.jobSecurity)}/${MAX_LEVELS.jobSecurity}`} />
              </div>
              <p className="card-hint">Click to flip for details.</p>
            </>
          }
          backContent={
            <>
              {renderMetricBar("Health", state.player.health, MAX_LEVELS.health)}
              {renderMetricBar("Job Security", state.player.jobSecurity, MAX_LEVELS.jobSecurity)}
            </>
          }
        />

        {/* ISLAND */}
        <FlipCard
          title="Island"
          subtitle="The world you shaped around you."
          summaryLine={summary.islandLine}
          flipped={flipped.island}
          onToggle={() => toggle("island")}
          frontContent={
            <>
              <div className="card-badges">
                <Badge label={`AQI: ${Math.round(state.environment.aqi)}/${MAX_LEVELS.aqi}`} />
                <Badge
                  label={`Sea: ${Number(state.environment.seaWaterLevel).toFixed(0)}/${MAX_LEVELS.seaWaterLevel}`}
                />
                <Badge
                  label={`Stress: ${Number(state.environment.climateStress).toFixed(0)}/${MAX_LEVELS.climateStress}`}
                />
              </div>
              <p className="card-hint">Click to flip for details.</p>
            </>
          }
          backContent={
            <>
              {renderMetricBar("AQI", state.environment.aqi, MAX_LEVELS.aqi)}
              {renderMetricBar(
                "Sea Water Level",
                state.environment.seaWaterLevel,
                MAX_LEVELS.seaWaterLevel,
                2
              )}
              {renderMetricBar(
                "Climate Stress",
                state.environment.climateStress,
                MAX_LEVELS.climateStress,
                2
              )}
            </>
          }
        />

        {/* FACTORY */}
        <FlipCard
          title="Factory"
          subtitle="Production kept you afloat — at a cost."
          summaryLine={summary.factoryLine}
          flipped={flipped.factory}
          onToggle={() => toggle("factory")}
          frontContent={
            <>
              <div className="card-badges">
                <Badge label={`Stability: ${Math.round(state.factory.stability)}/${MAX_LEVELS.factoryStability}`} />
                <Badge
                  label={`Profit: ${Math.round(state.factory.profitability)}/${MAX_LEVELS.factoryProfitability}`}
                />
                <Badge
                  label={`Waste: ${Math.round(state.factory.toxicWaste)}/${MAX_LEVELS.toxicWaste}`}
                />
              </div>
              <p className="card-hint">Click to flip for details.</p>
            </>
          }
          backContent={
            <>
              {renderMetricBar("Stability", state.factory.stability, MAX_LEVELS.factoryStability)}
              {renderMetricBar("Profitability", state.factory.profitability, MAX_LEVELS.factoryProfitability)}
              {renderMetricBar("Equipment Wear", state.factory.equipmentWear, MAX_LEVELS.equipmentWear)}
              {renderMetricBar("Toxic Waste", state.factory.toxicWaste, MAX_LEVELS.toxicWaste)}
              {renderMetricBar(
                "Treadmill Of Production",
                state.society.treadmillOfProduction,
                MAX_LEVELS.treadmillOfProduction
              )}
            </>
          }
        />
      </section>

      <footer className="end-tip">
        Tip: small wins add up — so do the hidden costs.
      </footer>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function Badge({ label }) {
  return <span className="end-badge">{label}</span>;
}

function FlipCard({
  title,
  subtitle,
  summaryLine,
  flipped,
  onToggle,
  frontContent,
  backContent
}) {
  return (
    <button
      type="button"
      className={`flip-card ${flipped ? "is-flipped" : ""}`}
      onClick={onToggle}
      aria-pressed={flipped}
    >
      <div className="flip-inner">
        <div className="flip-face flip-front">
          <div className="card-top">
            <div>
              <h2 className="card-title">{title}</h2>
              <p className="card-subtitle">{subtitle}</p>
            </div>
          </div>

          <div className="card-summary">{summaryLine}</div>

          <div className="card-body">{frontContent}</div>
        </div>

        <div className="flip-face flip-back">
          <div className="card-top">
            <div>
              <h2 className="card-title">{title}</h2>
              <p className="card-subtitle">Details</p>
            </div>
            <div className="card-hint">Click to flip back.</div>
          </div>

          <div className="card-body">{backContent}</div>
        </div>
      </div>
    </button>
  );
}