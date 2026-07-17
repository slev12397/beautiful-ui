"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * THINKING — expandable agent trace, four variants
 *
 *   Steps      step list with spinner → muted checks
 *   Reasoning  prose reasoning that expands, then settles
 *   Search     web-search trace: query + sources read
 *   Coding     tool trace: files read, edits, commands
 *
 * One loop: collapsed shimmer → expand → rows stagger in →
 * settle to a collapsed done label. Reduced motion snaps.
 * ───────────────────────────────────────────────────────── */

const STAGES = [800, 600, 1800, 2600, 1600];

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

type Row = {
  primary: string;
  secondary?: string;
  mono?: boolean;
  add?: number;
  del?: number;
};

const VARIANTS: Record<
  string,
  { active: string; done: string; rows: Row[]; query?: string }
> = {
  Steps: {
    active: "Thinking",
    done: "Thought for 4 seconds",
    rows: [
      { primary: "Analyzing the request" },
      { primary: "Searching the knowledge base" },
      { primary: "Reading sources", secondary: "6 chunks" },
      { primary: "Writing response" },
    ],
  },
  Reasoning: {
    active: "Thinking",
    done: "Thought for 4 seconds",
    rows: [
      { primary: "The user wants a comparison across both accounts, restricted to crypto assets only." },
      { primary: "I should merge on order_id to avoid duplicates, then surface the largest deltas first." },
    ],
  },
  Search: {
    active: "Searching the web",
    done: "Searched the web",
    query: "is the air quality bad today",
    rows: [
      { primary: "AirNow Interactive Map", secondary: "gispub.epa" },
      { primary: "National Maps | AirNow", secondary: "airnow" },
      { primary: "Daily Air Quality Report", secondary: "apcb" },
    ],
  },
  Coding: {
    active: "Running tools",
    done: "Ran 3 tools",
    rows: [
      { primary: "Read", secondary: "schema.ts", mono: true },
      { primary: "Edit", secondary: "TaskRows.tsx", mono: true, add: 74, del: 41 },
      { primary: "Run", secondary: "npm run build", mono: true },
    ],
  },
};

function Dot({ tone }: { tone: string }) {
  return (
    <span className={`flex size-3.5 shrink-0 items-center justify-center rounded-full text-white ${tone}`}>
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    </span>
  );
}

const TONES = ["bg-accent", "bg-orange", "bg-green"];

export default function ThinkingState({ variant = "Steps" }: { variant?: string }) {
  const stage = useLoop(STAGES);
  const v = VARIANTS[variant] ?? VARIANTS.Steps;
  const expanded = stage >= 1 && stage < 4;
  const working = stage < 3;
  const visible = stage < 2 ? 0 : stage === 2 ? Math.min(2, v.rows.length) : v.rows.length;

  return (
    <div className="min-h-[180px] w-full max-w-95" key={variant}>
      {/* header — shared across variants */}
      <button
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-control px-1.5 py-1
          transition-colors duration-100 hover:bg-hover-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={working ? "var(--ink-2)" : "var(--ink-3)"}>
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>
        {working ? (
          <span
            className="bg-clip-text text-[13px] font-medium whitespace-nowrap text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--ink-3) 35%, var(--ink) 50%, var(--ink-3) 65%)",
              backgroundSize: "200% 100%",
              animation: "shimmer-text 1.4s linear infinite",
            }}
          >
            {v.active}
          </span>
        ) : (
          <span
            className="text-[13px] font-medium whitespace-nowrap text-ink-2"
            style={{ animation: "fade-in 350ms ease-out both" }}
          >
            {v.done}
          </span>
        )}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          className="transition-transform duration-300"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* expandable trace */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="mt-1 ml-[5px] flex flex-col gap-1 border-l border-line py-1 pl-4">
            {v.query && (
              <div className="flex h-6 items-center gap-2" style={{ animation: expanded ? "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" : undefined }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <span className="text-[12.5px] text-ink-2">{v.query}</span>
              </div>
            )}
            {v.rows.slice(0, visible).map((row, i) => (
              <div
                key={row.primary}
                className="-mx-1.5 flex min-h-6 items-center gap-2 rounded-[6px] px-1.5 py-0.5
                  transition-colors duration-100 hover:bg-hover-2"
                style={{ animation: `fade-up 320ms cubic-bezier(0.23,1,0.32,1) ${i * 120}ms both` }}
              >
                {variant === "Search" && <Dot tone={TONES[i % 3]} />}
                {variant === "Steps" && (
                  i < visible - 1 || !working ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <span className="size-3 shrink-0 rounded-full border-[1.5px] border-line-strong border-t-ink-2" style={{ animation: "spin 700ms linear infinite" }} />
                  )
                )}
                <span className={`min-w-0 truncate text-[12.5px] ${variant === "Reasoning" ? "whitespace-normal leading-relaxed text-ink-2" : "font-medium text-ink"}`}>
                  {row.primary}
                </span>
                {row.secondary && (
                  <span className={`shrink-0 text-[11.5px] text-ink-3 ${row.mono ? "font-mono" : ""}`}>
                    {row.secondary}
                  </span>
                )}
                {row.add !== undefined && (
                  <span className="shrink-0 font-mono text-[11px] tabular-nums">
                    <span className="text-green">+{row.add}</span>{" "}
                    <span className="text-red">−{row.del}</span>
                  </span>
                )}
              </div>
            ))}
            {variant === "Search" && stage >= 3 && (
              <span className="text-[12px] text-ink-3" style={{ animation: "fade-in 300ms ease-out both" }}>
                +7 more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
