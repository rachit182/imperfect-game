import { useGame } from "../GameContext";

export default function IslandView() {
  const { state } = useGame();

  return (
    <div className="island">
      <div
        className="water"
        style={{ height: `${state.seaLevel * 100}%` }}
      />
      <div className="house">🏠</div>
    </div>
  );
}
