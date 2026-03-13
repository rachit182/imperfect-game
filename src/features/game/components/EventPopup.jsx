import { useContext } from "react";
import { GameContext } from "../state/GameContext";
import { PixelButton, PixelPanel } from "../../../ui/components/PixelUI";

const EVENT_CONTENT = {
  HOME_BUILD_CONFIRM: {
    title: "Improve Home",
    lines: [
      "Improving your home with a concrete barrier will cost you $1600.",
      "Continue now, or do it later?"
    ],
    choices: [
      { id: "CONTINUE", label: "Continue" },
      { id: "LATER", label: "Maybe later" }
    ]
  },
  ILLEGAL_WASTE_DUMPING: {
    title: "Illegal Waste Dumping",
    lines: [
      "You notice the factory dumping untreated waste into the ocean at night.",
      "If this continues, the water may become unsafe.",
      "The manager warns: Stay quiet if you want your job."
    ],
    choices: [
      { id: "REPORT", label: "Report to authorities" },
      { id: "SILENT", label: "Stay silent" }
    ]
  },
  FAMILY_ILLNESS: {
    title: "Family Illness",
    lines: [
      "AQI was too high, and your health decreased.",
      "Medical care is limited right now."
    ],
    choices: [{ id: "PRIVATE_TREATMENT", label: "Pay for private treatment ($500)" }]
  },
  HEALTH_DEGRADATION_WARNING: {
    title: "Health Degradation Warning",
    lines: [
      "Your health has dropped to a dangerous level.",
      "You should seek treatment before it gets worse."
    ],
    choices: [
      { id: "VISIT_DOCTOR", label: "Visit a doctor ($200)" },
      { id: "IGNORE_FOR_NOW", label: "Ignore for now" }
    ]
  },
  SEVERE_STORM: {
    title: "Severe Storm",
    lines: [
      "A severe storm hits the island.",
      "Flooding threatens the factory and your home."
    ],
    choices: [
      { id: "REBUILD_HIGHER", label: "Build a concrete risen home ($800)" },
      { id: "MINIMAL_REPAIR", label: "Do a temporary natural material fix ($200)" }
    ]
  },
  EQUIPMENT_FAILURE: {
    title: "Equipment Failure",
    lines: [
      "Aging machinery is failing.",
      "Management suggests skipping maintenance to save money."
    ],
    choices: [
      { id: "DEMAND_MAINTENANCE", label: "Demand maintenance" },
      { id: "CONTINUE_OPERATIONS", label: "Continue operations" }
    ]
  }
};

export default function EventPopup({ paused = false }) {
  const { state, dispatch } = useContext(GameContext);
  if (!state.activeEvent) return null;

  const eventData = EVENT_CONTENT[state.activeEvent.id];
  if (!eventData) return null;

  const canAffordHomeBuild = state.player.money >= 1600;
  const canAffordDoctor = state.player.money >= 200;

  return (
    <div className="event-popup-wrap">
      <PixelPanel className="event-popup">
        <h2>{eventData.title}</h2>
        {eventData.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}

        <div className="event-popup-actions">
          {eventData.choices.map((choice) => (
            <PixelButton
              key={choice.id}
              variant="action"
              disabled={
                paused ||
                (state.activeEvent.id === "HOME_BUILD_CONFIRM" &&
                  choice.id === "CONTINUE" &&
                  !canAffordHomeBuild) ||
                (state.activeEvent.id === "HEALTH_DEGRADATION_WARNING" &&
                  choice.id === "VISIT_DOCTOR" &&
                  !canAffordDoctor)
              }
              onClick={() =>
                dispatch({
                  type: "RESOLVE_EVENT",
                  payload: { choiceId: choice.id }
                })
              }
            >
              {choice.label}
            </PixelButton>
          ))}
        </div>
      </PixelPanel>
    </div>
  );
}
