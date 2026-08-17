"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * SIDEBAR NAV
 * Workspace navigation with direct selection and search.
 * ───────────────────────────────────────────────────────── */

const ITEMS = [
  { key: "activity", label: "Home", section: "Workspace" },
  { key: "tasks", label: "Agent tasks", section: "Workspace", count: true },
  { key: "dashboard", label: "Inbox", section: "Workspace" },
  { key: "spaces", label: "Suppliers", section: "Objects", plus: true },
  { key: "analytics", label: "Inventory", section: "Objects" },
];

/* Attio-style icons: rounded geometry, soft joins, rendered at 16. */
function Icon({ kind }: { kind: string }) {
  const p: Record<string, React.ReactNode> = {
    activity: <g><path d="M4 11.4 12 5l8 6.4" /><path d="M6 10v8.2c0 .72.58 1.3 1.3 1.3h9.4c.72 0 1.3-.58 1.3-1.3V10" /></g>,
    tasks: <g><rect x="4" y="4" width="16" height="16" rx="4.5" /><path d="m8.6 12 2.4 2.4L15.6 9.5" /></g>,
    spaces: <g><path d="M12 3.2 4 7v10l8 3.8 8-3.8V7l-8-3.8Z" /><path d="M4 7l8 3.8L20 7M12 20.6V10.8" /></g>,
    dashboard: <g><path d="M20 5H4a1.5 1.5 0 0 0-1.5 1.5V9h19V6.5A1.5 1.5 0 0 0 20 5Z" /><path d="M21.5 9v8.5A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5V9M8.5 12.5h7" /></g>,
    analytics: <g><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M8 15.5v-3M12 15.5v-6M16 15.5v-4" /></g>,
  };
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {p[kind]}
    </svg>
  );
}

export default function SidebarNav() {
  const [active, setActive] = useState("tasks");
  const [hovered, setHovered] = useState<string | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [query, setQuery] = useState("");
  const [badge, setBadge] = useState(4);
  const sections = ["Workspace", "Objects"];
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    const container = navRef.current;
    const target = itemRefs.current[hovered ?? active];
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setBox({
      top: targetRect.top - containerRect.top,
      height: targetRect.height,
    });
  }, [hovered, active]);

  return (
    <div className="w-60 rounded-card bg-surface p-2 shadow-raised">
      {/* workspace row */}
      <button
        type="button"
        className="mb-2 flex w-full items-center gap-2.5 rounded-control p-1.5 text-left
          transition-[background-color,transform] duration-100 hover:bg-hover active:scale-[0.96]"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]" style={{ background: "linear-gradient(155deg,#5aa2ff,#1f3fb0)" }}>
          C
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium leading-tight text-ink">Creamery Ops</span>
          <span className="block truncate text-[11px] leading-tight text-ink-3">Production Workspace</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* quick search */}
      <label className="mb-1 flex h-8 items-center gap-2 rounded-control bg-inset px-2.5 shadow-hairline">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Quick search"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="flex size-4.5 items-center justify-center rounded-[5px] bg-surface text-[10px] text-ink-3 shadow-hairline">
          /
        </kbd>
      </label>

      {/* accent action */}
      <button
        type="button"
        onClick={() => {
          setBadge((current) => current + 1);
          setActive("tasks");
        }}
        className="mb-2 flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-[13px]
          font-medium text-accent transition-[background-color,transform] duration-100 hover:bg-accent-tint active:scale-[0.96]"
      >
        <span className="min-w-0 flex-1 truncate text-left">New task</span>
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>

      {/* items */}
      <div
        ref={navRef}
        onMouseLeave={() => setHovered(null)}
        className="relative flex flex-col gap-2"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-[7px] bg-hover"
          style={{
            top: box?.top ?? 0,
            height: box?.height ?? 0,
            opacity: box ? 1 : 0,
            transition:
              "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
          }}
        />
        {sections.map((section) => (
          <div key={section}>
            <div className="px-2 pb-1 pt-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-3">
              {section}
            </div>
            <div className="flex flex-col gap-px">
              {ITEMS.filter((item) => item.section === section).map((item) => {
                const isActive = item.key === active;
                return (
                  <button
                    key={item.key}
                    ref={(el) => {
                      itemRefs.current[item.key] = el;
                    }}
                    type="button"
                    onMouseEnter={() => setHovered(item.key)}
                    onFocus={() => setHovered(item.key)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setActive(item.key)}
                    aria-current={isActive ? "page" : undefined}
                    className="group relative z-10 flex w-full items-center gap-2 rounded-[7px] px-2 py-1.5 text-left
                      transition-[color,transform] duration-150 active:scale-[0.96]"
                  >
                    <span className={isActive ? "text-ink" : "text-ink-3"}>
                      <Icon kind={item.key} />
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-[13px] transition-colors duration-150
                        ${isActive ? "font-semibold text-ink" : "font-medium text-ink-2"}`}
                    >
                      {item.label}
                    </span>
                    {item.count && (
                      <span
                        key={badge}
                        className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10.5px] font-semibold tabular-nums ${
                          isActive ? "bg-surface text-ink-2 shadow-hairline" : "bg-accent-tint text-accent-ink"
                        }`}
                        style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
                      >
                        {badge}
                      </span>
                    )}
                    {item.plus && (
                      <span
                        className="flex size-4.5 items-center justify-center rounded-[5px] text-ink-3 opacity-0
                          transition-[background-color,color,opacity] duration-100 group-hover:opacity-100 hover:bg-line/70 hover:text-ink-2"
                        style={isActive ? { opacity: 1 } : undefined}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
