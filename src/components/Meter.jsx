// src/components/Meter.jsx
import React from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getLevel(value) {
  if (value >= 70) return "good";
  if (value >= 40) return "warn";
  return "bad";
}

export default function Meter({ label, value }) {
  const v = clamp(Number(value ?? 0), 0, 100);
  const level = getLevel(v);

  return (
    <div className="meter" aria-label={`${label}: ${v} out of 100`}>
      <div className="meter__top">
        <div className="meter__label" title={label}>
          {label}
        </div>
        <div className="meter__value">{v}</div>
      </div>

      <div className="meter__track" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`meter__fill meter__fill--${level}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
