import { useContext } from "react";
import { GameContext } from "../state/GameContext";

const EVENT_CONTENT = {
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
  WATER_TABLE_COLLAPSE_WARNING: {
    title: "Water Table Collapse Warning",
    lines: [
      "The island groundwater is running low and saltwater intrusion has begun.",
      "Experts recommend restricting factory water use."
    ],
    choices: [
      { id: "RESTRICT", label: "Support water restriction" },
      { id: "IGNORE", label: "Ignore warning" }
    ]
  },
  FAMILY_ILLNESS: {
    title: "Family Illness",
    lines: [
      "Your child develops severe breathing issues.",
      "The hospital is overwhelmed."
    ],
    choices: [
      { id: "PRIVATE_TREATMENT", label: "Pay for private treatment ($500)" },
      { id: "PUBLIC_HOSPITAL", label: "Wait for public hospital" }
    ]
  },
  SEVERE_STORM: {
    title: "Severe Storm",
    lines: [
      "A severe storm hits the island.",
      "Flooding threatens the factory and your home."
    ],
    choices: [
      { id: "REBUILD_HIGHER", label: "Rebuild home higher ($800)" },
      { id: "MINIMAL_REPAIR", label: "Repair minimally ($200)" }
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

export default function EventPopup() {
  const { state, dispatch } = useContext(GameContext);
  if (!state.activeEvent) return null;

  const eventData = EVENT_CONTENT[state.activeEvent.id];
  if (!eventData) return null;

  return (
    <div className="popup">
      <h2>{eventData.title}</h2>
      {eventData.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}

      <div className="popup-actions">
        {eventData.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() =>
              dispatch({
                type: "RESOLVE_EVENT",
                payload: { choiceId: choice.id }
              })
            }
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
