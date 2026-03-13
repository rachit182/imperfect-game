import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function PixelPanel({ className = "", children, ...props }) {
  return (
    <section className={`pixel-panel ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function PixelButton({ className = "", children, variant = "primary", ...props }) {
  return (
    <button className={`pixel-button pixel-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function ScreenBackButton({ onClick, label = "Back" }) {
  return (
    <button
      type="button"
      className="screen-top-back"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{"<"}</span>
      <span>{label}</span>
    </button>
  );
}

export function PixelBadge({ className = "", children }) {
  return <span className={`pixel-badge ${className}`.trim()}>{children}</span>;
}

function FloatingTooltip({ open, anchorRef, label, description, id }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "top" });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !tooltipRef.current) return;

    const margin = 8;
    const gap = 8;
    const triggerRect = anchorRef.current.getBoundingClientRect();
    const tipRect = tooltipRef.current.getBoundingClientRect();

    let placement = "top";
    let top = triggerRect.top - tipRect.height - gap;

    if (top < margin) {
      placement = "bottom";
      top = triggerRect.bottom + gap;
    }

    if (top + tipRect.height > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - tipRect.height - margin);
    }

    let left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));

    setPosition({ top, left, placement });
  }, [anchorRef, open, label, description]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => {
      if (!anchorRef.current || !tooltipRef.current) return;

      const margin = 8;
      const gap = 8;
      const triggerRect = anchorRef.current.getBoundingClientRect();
      const tipRect = tooltipRef.current.getBoundingClientRect();

      let placement = "top";
      let top = triggerRect.top - tipRect.height - gap;

      if (top < margin) {
        placement = "bottom";
        top = triggerRect.bottom + gap;
      }

      if (top + tipRect.height > window.innerHeight - margin) {
        top = Math.max(margin, window.innerHeight - tipRect.height - margin);
      }

      let left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));

      setPosition({ top, left, placement });
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [anchorRef, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <span
      ref={tooltipRef}
      id={id}
      className={`pixel-tooltip-floating pixel-tooltip-floating--${position.placement}`}
      role="tooltip"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <strong>{label}</strong>
      <span>{description}</span>
    </span>,
    document.body
  );
}

export function TooltipTrigger({ label, description, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const tooltipId = useId();

  return (
    <>
      <span
        ref={triggerRef}
        className="metric-row__info"
        tabIndex={0}
        aria-label={ariaLabel || `${label} info`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="metric-row__info-icon" aria-hidden="true">
          i
        </span>
      </span>
      <FloatingTooltip
        open={open}
        anchorRef={triggerRef}
        label={label}
        description={description}
        id={tooltipId}
      />
    </>
  );
}

export function MetricBar({ icon, label, description, value, max, decimals = 0 }) {
  const clamped = Math.max(0, Math.min(value, max));
  const fill = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div className="metric-row">
      <div className="metric-row__head">
        <span className="metric-row__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="metric-row__label">{label}</span>
        <span className="metric-row__value">{Number(value).toFixed(decimals)}</span>
        <TooltipTrigger label={label} description={description} />
      </div>
      <div
        className="metric-row__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-label={label}
      >
        <span className="metric-row__fill" style={{ width: `${fill}%` }} />
      </div>
    </div>
  );
}
