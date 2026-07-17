"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * CONTEXT CARDS — storyboard
 *
 *     0ms   header row fades in ("All chunks · 32")
 *   250ms   chunk cards enter, staggered 120ms
 *   900ms   source chips pop
 *  4800ms   reset
 * ───────────────────────────────────────────────────────── */

const CHUNKS = [
  {
    id: "Chunk-01",
    chars: "290 characters",
    body: "To connect your email, open the Integrations tab and select Gmail. Grant read access so the agent can sync recent messages.",
    source: "Onboarding Guide.pdf",
  },
  {
    id: "Chunk-02",
    chars: "1,250 characters",
    body: "After connecting, the agent analyzes recent emails to detect patterns — replies, summaries, and tagging.",
    source: "Onboarding Guide.pdf",
  },
];

export default function ContextCards() {
  const [cycle, setCycle] = useState(0);
  const [chipsShown, setChipsShown] = useState(false);

  useEffect(() => {
    const chips = setTimeout(() => setChipsShown(true), 700);
    const reset = setTimeout(() => {
      setChipsShown(false);
      setCycle((c) => c + 1);
    }, 6000);
    return () => {
      clearTimeout(chips);
      clearTimeout(reset);
    };
  }, [cycle]);

  return (
    <div key={cycle} className="flex w-full max-w-95 flex-col gap-2">
      <div
        className="flex items-center gap-2 px-0.5"
        style={{ animation: "fade-in 400ms ease-out both" }}
      >
        <span className="text-[13px] font-semibold text-ink">All chunks</span>
        <span className="inline-flex h-5 items-center rounded-md bg-inset px-1.5 text-[11.5px] font-medium text-ink-2 shadow-hairline tabular-nums">
          32
        </span>
      </div>

      {CHUNKS.map((chunk, i) => (
        <div
          key={chunk.id}
          className="overflow-hidden rounded-card bg-surface shadow-card transition-shadow duration-150 hover:shadow-raised"
          style={{
            animation: `fade-up 400ms cubic-bezier(0.23,1,0.32,1) ${i * 100}ms both`,
          }}
        >
          <div className="flex items-center gap-2.5 border-b border-line px-3 py-1.5">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
              {chunk.id}
            </span>
            <span className="text-[12px] text-ink-3 tabular-nums">{chunk.chars}</span>
          </div>
          <p className="line-clamp-2 px-3 py-1.5 text-[12.5px] leading-relaxed text-ink-2">
            {chunk.body}
          </p>
          <div className="px-3 pb-2.5">
            <span
              className="inline-flex h-6 items-center gap-1.5 rounded-full bg-inset px-2
                text-[12px] font-medium text-ink-2 shadow-btn
                transition-[opacity,transform,background-color] duration-300 hover:bg-hover"
              style={{
                opacity: chipsShown ? 1 : 0,
                transform: chipsShown ? "scale(1)" : "scale(0.95)",
                transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <span className="flex size-3.5 items-center justify-center rounded-[4px] bg-red text-[7px] font-bold text-white">
                PDF
              </span>
              {chunk.source}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
