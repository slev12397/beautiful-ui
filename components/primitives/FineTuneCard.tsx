"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * FINE-TUNE CARD — Layo-style storyboard
 * The agent adjusts design properties in an inspector panel.
 *
 *     0ms   idle panel, "Auto-tune" badge shimmers
 *   800ms   segmented layout control slides to column
 *  1600ms   radius field flashes accent, 28 → 12
 *  2400ms   opacity field flashes, 100% → 92%
 *  3200ms   Type dropdown opens
 *  4000ms   "Overlay" hovers, selects, menu closes
 *  4800ms   header settles to green "Tuned" check
 *  7400ms   reset
 * ───────────────────────────────────────────────────────── */

const STAGES = [800, 800, 800, 800, 800, 800, 2600];

function useLoop(steps: number[]) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setStage((s) => (s + 1) % steps.length),
      steps[stage],
    );
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

/* Layo filled field — label + value inline on a quiet gray fill */
function Field({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className="flex h-6.5 flex-1 items-center gap-2 rounded-chip py-1 pr-1.5 pl-2
        transition-[background-color,box-shadow] duration-200"
      style={{
        background: active ? "var(--accent-tint)" : "var(--field)",
        boxShadow: active ? "0 0 0 1px var(--accent)" : "none",
      }}
    >
      <span className="text-[12px] text-ink-3">{label}</span>
      <span
        key={value}
        className="text-[12px] text-ink tabular-nums"
        style={{ animation: "stream-in 300ms ease-out both" }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] font-medium text-ink">{children}</p>;
}

const SEGMENTS = ["row", "col", "grid"] as const;

function SegmentIcon({ kind }: { kind: string }) {
  const dot = "size-1.5 rounded-[2px] border-[1.2px] border-current";
  if (kind === "row")
    return <span className="flex gap-0.5">{[0, 1, 2].map((i) => <span key={i} className={dot} />)}</span>;
  if (kind === "col")
    return <span className="flex flex-col gap-0.5">{[0, 1].map((i) => <span key={i} className={dot} />)}</span>;
  return (
    <span className="grid grid-cols-2 gap-0.5">
      {[0, 1, 2, 3].map((i) => <span key={i} className={dot} />)}
    </span>
  );
}

export default function FineTuneCard() {
  const stage = useLoop(STAGES);
  const seg = stage >= 1 ? 1 : 0;
  const radiusTouched = stage === 2;
  const opacityTouched = stage === 3;
  const menuOpen = stage === 4 || stage === 5;
  const optionPicked = stage === 5;
  const done = stage >= 6;
  const typeValue = done ? "Limited" : "Select type";

  return (
    <div className="relative w-60 rounded-card bg-surface shadow-raised">
      {/* header */}
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <span className="text-[13px] font-medium text-ink">Flavor card</span>
        {done ? (
          <span
            className="flex items-center gap-1.5 text-[12px] font-medium text-green"
            style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Tuned
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="flex size-4.5 items-center justify-center rounded-[5px] border border-accent/30 bg-accent-tint">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
              </svg>
            </span>
            <span
              className="bg-clip-text text-[12px] font-medium text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--accent) 35%, var(--accent-ink) 50%, var(--accent) 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite",
              }}
            >
              Auto-tune
            </span>
          </span>
        )}
      </div>

      {/* layout section */}
      <div className="flex flex-col gap-2 border-b border-line px-3 py-3">
        <SectionLabel>Layout</SectionLabel>
        {/* Layo segmented: gray track, raised white thumb */}
        <div className="relative grid grid-cols-3 rounded-control bg-field p-0.5">
          <span
            aria-hidden
            className="absolute inset-y-0.5 rounded-[6px] bg-surface shadow-btn transition-transform duration-300"
            style={{
              width: "calc((100% - 4px) / 3)",
              left: 2,
              transform: `translateX(${seg * 100}%)`,
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
          {SEGMENTS.map((s, i) => (
            <span
              key={s}
              className={`relative z-10 flex h-6 items-center justify-center transition-colors duration-200
                ${i === seg ? "text-accent" : "text-ink-3"}`}
            >
              <SegmentIcon kind={s} />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Field label="W" value="324" />
          <Field label="H" value="96" />
        </div>
        <div className="flex gap-2">
          <Field label="Radius" value={stage >= 2 ? "12" : "28"} active={radiusTouched} />
          <Field label="Opacity" value={stage >= 3 ? "92%" : "100%"} active={opacityTouched} />
        </div>
      </div>

      {/* interaction section */}
      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-[12px] text-ink-3">Type</span>
        <div className="relative w-30">
          {/* Layo select — filled, inset shadow */}
          <div
            className="flex h-6.5 items-center justify-between rounded-chip bg-field py-1 pr-1 pl-2
              shadow-inset-field transition-shadow duration-200"
            style={{ boxShadow: menuOpen ? "inset 0 1px 2px rgba(0,0,0,0.12), 0 0 0 1px var(--accent)" : undefined }}
          >
            <span
              key={typeValue}
              className={`text-[12px] ${done ? "text-ink" : "text-ink-3"}`}
              style={{ animation: "fade-in 200ms ease-out both" }}
            >
              {typeValue}
            </span>
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform duration-200"
              style={{ transform: menuOpen ? "rotate(180deg)" : "rotate(0)" }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* dropdown — drops up to stay in frame */}
          {menuOpen && (
            <div
              className="absolute right-0 bottom-8 z-10 w-30 rounded-control bg-surface p-1 shadow-raised"
              style={{
                animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both",
                transformOrigin: "bottom right",
              }}
            >
              {["Seasonal", "Classic", "Limited"].map((item) => (
                <div
                  key={item}
                  className="flex h-6.5 items-center rounded-[6px] px-2 text-[12.5px] text-ink
                    transition-colors duration-150 hover:bg-field"
                  style={{
                    background:
                      item === "Limited" && optionPicked ? "var(--field)" : "transparent",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
