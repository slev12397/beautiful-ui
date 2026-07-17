"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * SIDEBAR NAV — storyboard
 * Workspace navigation: quick search, accent action, items.
 *
 * Selection moves Tasks → Spaces → Analytics on a loop;
 * a count badge ticks up on Tasks while it's not selected.
 * ───────────────────────────────────────────────────────── */

const ITEMS = [
  { key: "activity", label: "Activity" },
  { key: "tasks", label: "Flavors" },
  { key: "spaces", label: "Suppliers", plus: true },
  { key: "dashboard", label: "Dashboard" },
  { key: "analytics", label: "Analytics" },
];

const SEQUENCE = ["tasks", "spaces", "analytics"];

function Icon({ kind }: { kind: string }) {
  const p: Record<string, React.ReactNode> = {
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    tasks: <g><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></g>,
    spaces: <g><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></g>,
    dashboard: <g><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></g>,
    analytics: <g><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></g>,
  };
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {p[kind]}
    </svg>
  );
}

export default function SidebarNav() {
  const [step, setStep] = useState(0);
  const [badge, setBadge] = useState(3);
  const active = SEQUENCE[step];

  useEffect(() => {
    const t = setTimeout(() => {
      setStep((s) => (s + 1) % SEQUENCE.length);
      setBadge((b) => (b >= 6 ? 3 : b + 1));
    }, 2000);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="w-56 rounded-card bg-surface p-2 shadow-raised">
      {/* workspace row */}
      <div className="mb-1 flex items-center gap-2 rounded-control px-2 py-1.5 transition-colors duration-100 hover:bg-hover">
        <span className="flex size-5 items-center justify-center rounded-[6px] bg-ink text-[9px] font-semibold text-surface">
          C
        </span>
        <span className="flex-1 text-[13px] font-medium text-ink">Creamery</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
        </svg>
      </div>

      {/* quick search */}
      <div className="mb-1 flex h-7 items-center gap-2 rounded-control bg-field px-2 shadow-inset-field">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <span className="flex-1 text-[12.5px] text-ink-3">Quick search</span>
        <kbd className="flex size-4.5 items-center justify-center rounded-[4px] bg-surface text-[10px] text-ink-3 shadow-btn">
          /
        </kbd>
      </div>

      {/* accent action */}
      <button
        className="mb-1 flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-[13px]
          font-medium text-accent-ink transition-colors duration-100 hover:bg-accent-tint"
      >
        <span className="flex size-4 items-center justify-center rounded-full bg-accent text-white">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        New flavor
      </button>

      <div className="mx-2 my-1 h-px bg-line" />

      {/* items */}
      <div className="flex flex-col gap-px">
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <div
              key={item.key}
              className={`flex cursor-pointer items-center gap-2 rounded-control px-2 py-1.5
                transition-colors duration-150 ${isActive ? "bg-field" : "hover:bg-hover"}`}
            >
              <span className={isActive ? "text-ink" : "text-ink-3"}>
                <Icon kind={item.key} />
              </span>
              <span
                className={`flex-1 text-[13px] transition-colors duration-150
                  ${isActive ? "font-medium text-ink" : "text-ink-2"}`}
              >
                {item.label}
              </span>
              {item.key === "tasks" && !isActive && (
                <span
                  key={badge}
                  className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full
                    bg-accent-tint px-1 text-[10.5px] font-semibold text-accent-ink tabular-nums"
                  style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
                >
                  {badge}
                </span>
              )}
              {item.plus && isActive && (
                <span
                  className="flex size-4.5 items-center justify-center rounded-[5px] text-ink-3
                    transition-colors duration-100 hover:bg-line/70 hover:text-ink-2"
                  style={{ animation: "fade-in 200ms ease-out both" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
