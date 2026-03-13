import { useMemo, useState } from "react";
import creditsText from "../assets/audio/imperfect-bg-music-credits.txt?raw";
import { PixelBadge, PixelButton, PixelPanel, ScreenBackButton } from "../ui/components/PixelUI";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

function parseCredits(raw) {
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const url = lines.find((line) => line.startsWith("http")) || "https://opengameart.org";
  const creditLine =
    lines.find((line) => line.toLowerCase().includes("credit")) ||
    "Background music: Loading Screen Loop by Brandon Morris (CC0 Public Domain).";

  return { url, creditLine };
}

export default function DashboardScreen({
  slots,
  onSelectSlot,
  onDeleteSlot,
  onBackToStart,
  volume,
  onVolumeChange
}) {
  const [view, setView] = useState("menu");
  const { url, creditLine } = useMemo(() => parseCredits(creditsText.trim()), []);

  const handleDelete = (slotId) => {
    const confirmed = window.confirm(
      `Delete Slot ${slotId}? This will permanently remove saved progress.`
    );

    if (confirmed) {
      onDeleteSlot(slotId);
    }
  };

  return (
    <div className="screen screen--dashboard">
      <PixelPanel className="dashboard-shell">
        {(view === "menu" || view === "slots" || view === "settings") && (
          <ScreenBackButton
            label="Back"
            onClick={view === "menu" ? onBackToStart : () => setView("menu")}
          />
        )}
        <h1>Imperfect</h1>
        <p className="dashboard-subtitle">Choose how to continue your story.</p>

        {view === "menu" && (
          <div className="dashboard-main-actions">
            <PixelButton onClick={() => setView("slots")}>Play</PixelButton>
            <PixelButton variant="secondary" onClick={() => setView("settings")}>
              Settings
            </PixelButton>
          </div>
        )}

        {view === "slots" && (
          <div className="slot-grid">
            {slots.map((slot) => (
              <PixelPanel
                key={slot.id}
                className={`slot-card ${slot.isEmpty ? "slot-card--empty" : "slot-card--occupied"}`}
              >
                <div className="slot-head">
                  <h3>Slot {slot.id}</h3>
                  <PixelBadge>{slot.isEmpty ? "Empty" : "Occupied"}</PixelBadge>
                </div>
                {slot.isEmpty ? (
                  <p>Start a new run in this slot.</p>
                ) : (
                  <>
                    <p>Day {slot.day}</p>
                    <p>${slot.money}</p>
                    <p className="slot-updated">Updated: {formatTime(slot.updatedAt)}</p>
                  </>
                )}
                <div className="slot-actions">
                  <PixelButton variant="action" onClick={() => onSelectSlot(slot.id)}>
                    {slot.isEmpty ? "New Run" : "Load"}
                  </PixelButton>
                  {!slot.isEmpty && (
                    <PixelButton variant="danger" onClick={() => handleDelete(slot.id)}>
                      Delete
                    </PixelButton>
                  )}
                </div>
              </PixelPanel>
            ))}
          </div>
        )}

        {view === "settings" && (
          <PixelPanel className="settings-panel">
            <h3>Settings</h3>
            <label className="volume-row">
              <span>Music Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => onVolumeChange(Number(event.target.value))}
              />
              <span>{Math.round(volume * 100)}%</span>
            </label>
          </PixelPanel>
        )}
      </PixelPanel>

      <p className="music-credits music-credits--floating">
        {creditLine}{" "}
        <a href={url} target="_blank" rel="noreferrer">
          OpenGameArt.org
        </a>
      </p>
    </div>
  );
}
