import Controls from "../features/game/components/Controls";
import EventPopup from "../features/game/components/EventPopup";
import GameHud from "../features/game/components/GameHud";
import { PixelButton, PixelPanel } from "../ui/components/PixelUI";

export default function GameScreen({
  paused,
  onPauseToggle,
  onResume,
  onSaveAndQuit,
  canSaveAndQuit
}) {
  return (
    <div className="screen screen--game">
      <GameHud />

      <button className="pause-button" onClick={onPauseToggle} aria-label="Pause menu">
        ||
      </button>

      <Controls paused={paused} />
      <EventPopup paused={paused} />

      {paused && (
        <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Paused">
          <PixelPanel className="pause-menu">
            <h2>Paused</h2>
            <p>The game is paused.</p>
            <div className="pause-actions">
              <PixelButton onClick={onResume}>Resume</PixelButton>
              <PixelButton
                variant="action"
                onClick={onSaveAndQuit}
                disabled={!canSaveAndQuit}
              >
                Save and Quit
              </PixelButton>
            </div>
          </PixelPanel>
        </div>
      )}
    </div>
  );
}
