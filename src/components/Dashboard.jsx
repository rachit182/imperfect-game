import { useContext, useEffect } from "react";
import { GameContext } from "../state/GameContext";

export default function Dashboard() {
  const { state, dispatch } = useContext(GameContext);

  useEffect(() => {
    dispatch({ type: "UPDATE_WAGE" });
  }, [state.player.jobSecurity]);

  return (
    <div className="dashboard">
      <div className="dashboard-group">
        <p>Day: {state.meta.day}</p>
        <p>Hours: {state.meta.hoursUsed} / 24</p>
        <p>Daily Household Expense: ${state.economy.householdExpense}</p>
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
