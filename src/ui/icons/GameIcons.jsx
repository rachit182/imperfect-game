import React from "react";

function IconBase({ children, title }) {
  return (
    <svg viewBox="0 0 24 24" className="game-icon" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function HeartIcon() {
  return (
    <IconBase title="Health">
      <path d="M12 21 3 12a5.4 5.4 0 0 1 0-7.6 5.3 5.3 0 0 1 7.6 0L12 5.8l1.4-1.4a5.3 5.3 0 0 1 7.6 0 5.4 5.4 0 0 1 0 7.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </IconBase>
  );
}

export function WorkerIcon() {
  return (
    <IconBase title="Job Security">
      <path d="M4 10h16v10H4zM8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      <path d="M12 15.5v2.5" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

export function SmogIcon() {
  return (
    <IconBase title="AQI">
      <path d="M4 16h8a3 3 0 0 0 0-6 4 4 0 0 0-7-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 20h12M9 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

export function WavesIcon() {
  return (
    <IconBase title="Water Level">
      <path d="M2 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" fill="none" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

export function FactoryIcon() {
  return (
    <IconBase title="Factory">
      <path d="M3 20V10l5 3V10l5 3V8l8-3v15z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 5V2h3v2" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

export function IncomeIcon() {
  return (
    <IconBase title="Daily Wage">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 12h8M14 9l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </IconBase>
  );
}

export function ExpenseIcon() {
  return (
    <IconBase title="Expenditure">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 12H8M10 9l-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </IconBase>
  );
}

export function InfoIcon() {
  return (
    <IconBase title="Info">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 10v6M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </IconBase>
  );
}
