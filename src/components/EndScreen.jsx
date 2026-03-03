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

export default function EndScreen({ state }) {
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
    <div className="container">
      <h1>Imperfect the game</h1>
      <h2>Game Over</h2>
      <p>You died of {state.meta.deathCause || "unknown disease"}.</p>

      <div className="dashboard">
        <div className="dashboard-group">
          <p>Final Day: {state.meta.day}</p>
          <p>Final Money: ${state.player.money}</p>
          {renderMetricBar("Final Health", state.player.health, MAX_LEVELS.health)}
          {renderMetricBar(
            "Final Job Security",
            state.player.jobSecurity,
            MAX_LEVELS.jobSecurity
          )}
        </div>

        <div className="dashboard-group">
          {renderMetricBar("Final AQI", state.environment.aqi, MAX_LEVELS.aqi)}
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
        </div>

        <div className="dashboard-group hidden-group">
          <p>Factory Snapshot</p>
          {renderMetricBar(
            "Stability",
            state.factory.stability,
            MAX_LEVELS.factoryStability
          )}
          {renderMetricBar(
            "Profitability",
            state.factory.profitability,
            MAX_LEVELS.factoryProfitability
          )}
          {renderMetricBar(
            "Equipment Wear",
            state.factory.equipmentWear,
            MAX_LEVELS.equipmentWear
          )}
          {renderMetricBar(
            "Toxic Waste",
            state.factory.toxicWaste,
            MAX_LEVELS.toxicWaste
          )}
          {renderMetricBar(
            "Treadmill Of Production",
            state.society.treadmillOfProduction,
            MAX_LEVELS.treadmillOfProduction
          )}
        </div>
      </div>
    </div>
  );
}
