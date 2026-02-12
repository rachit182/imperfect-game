import { useContext, useEffect } from "react";
import { GameContext } from "../state/GameContext";

export default function Dashboard() {
  const { state, dispatch } = useContext(GameContext);
  const formatTimeFromStart = (hoursFromStart) => {
    const startHour24 = 9; // 9:00 AM
    const hour24 = (startHour24 + hoursFromStart) % 24;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:00 ${period}`;
  };

  useEffect(() => {
    dispatch({ type: "UPDATE_WAGE" });
  }, [state.player.jobSecurity]);

  return (
    <div className="dashboard">
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
        <p>Health: {state.player.health}</p>
        <p>Job Security: {state.player.jobSecurity}</p>
      </div>

      <div className="dashboard-group">
        <p>AQI: {state.environment.aqi}</p>
        <p>Water Level: {state.environment.waterLevel}</p>
      </div>
    </div>
  );
}
