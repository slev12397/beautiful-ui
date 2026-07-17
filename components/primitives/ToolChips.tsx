"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * TOOL CHIPS — storyboard
 * An agent run as compact rows: tool calls with inline
 * chips, then file-diff chips summarizing the edits.
 * Rows appear in sequence, diff chips pop at the end.
 * ───────────────────────────────────────────────────────── */

const HOLD_MS = 3200;
const STEP_MS = 700;

const Icons: Record<string, React.ReactNode> = {
  think: <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />,
  write: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></g>,
  run: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-5-6-5M12 19h8" /></g>,
  read: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></g>,
};

const ROWS = [
  { icon: "think", label: "Thinking", chip: "Planning the churn schedule…", mono: false },
  { icon: "write", label: "Write 204 lines", chip: "ChurnSchedule.tsx", mono: true },
  { icon: "run", label: "Rebuild and verify", chip: "npm run freeze", mono: true },
  { icon: "read", label: "Read image", chip: "flavor-chart.png", mono: true },
];

const DIFFS = [
  { file: "flavors.css", add: 13, del: 0 },
  { file: "ChurnSchedule.tsx", add: 74, del: 41 },
  { file: "menu.ts", add: 8, del: 2 },
];

export default function ToolChips() {
  const [step, setStep] = useState(0);
  const total = ROWS.length + 1; // rows, then diff chips

  useEffect(() => {
    const t = setTimeout(
      () => setStep((s) => (s + 1) % (total + 1)),
      step === total ? HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(t);
  }, [step, total]);

  return (
    <div className="min-h-[188px] w-full max-w-95">
      {/* collapsed run header */}
      <button className="-mx-1.5 flex w-fit items-center gap-1.5 rounded-control px-1.5 py-1 text-[12.5px] text-ink-2 transition-colors duration-100 hover:bg-hover-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span className="tabular-nums">4 tool calls, 2 messages</span>
      </button>

      {/* tool call rows */}
      <div className="mt-1.5 flex flex-col gap-1">
        {ROWS.slice(0, step).map((row) => (
          <div
            key={row.label}
            className="flex h-7 items-center gap-2"
            style={{ animation: "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <span className="flex size-4 items-center justify-center text-ink-3">
              <svg width="13" height="13" viewBox="0 0 24 24" fill={row.icon === "think" ? "currentColor" : "none"} stroke="currentColor">
                {Icons[row.icon]}
              </svg>
            </span>
            <span className="text-[12.5px] font-medium text-ink">{row.label}</span>
            <span
              className={`inline-flex h-5.5 min-w-0 items-center truncate rounded-chip bg-field px-1.5
                text-[11.5px] text-ink-2 shadow-hairline transition-colors duration-100 hover:bg-hover
                ${row.mono ? "font-mono" : ""}`}
            >
              {row.chip}
            </span>
          </div>
        ))}
      </div>

      {/* file-diff chips */}
      {step >= total && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
          {DIFFS.map((d, i) => (
            <span
              key={d.file}
              className="inline-flex h-6 cursor-default items-center gap-1.5 rounded-chip
                bg-surface px-2 font-mono text-[11.5px] text-ink shadow-btn
                transition-colors duration-100 hover:bg-hover"
              style={{ animation: `pop-in 250ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms both` }}
            >
              {d.file}
              <span className="text-green tabular-nums">+{d.add}</span>
              {d.del > 0 && <span className="text-red tabular-nums">−{d.del}</span>}
            </span>
          ))}
          <span
            className="inline-flex h-6 items-center rounded-chip px-1.5 font-mono text-[11.5px] text-ink-3"
            style={{ animation: `fade-in 300ms ease-out ${DIFFS.length * 80}ms both` }}
          >
            +2 more
          </span>
        </div>
      )}
    </div>
  );
}
