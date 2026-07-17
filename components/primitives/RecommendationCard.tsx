"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * RECOMMENDATION CARD — storyboard
 *
 * Cycles three confidence states every 3s with a blurred
 * crossfade: High confidence → Needs review → No signal
 * ───────────────────────────────────────────────────────── */

const STATE_MS = 3000;
const SWAP_MS = 250;

const STATES = [
  {
    key: "high",
    body: (
      <>
        Incremental (merge) with watermark{" "}
        <code className="rounded-md bg-accent-tint px-1.5 py-0.5 font-mono text-[12px] text-accent-ink">updated_at</code>{" "}
        and primary key{" "}
        <code className="rounded-md bg-accent-tint px-1.5 py-0.5 font-mono text-[12px] text-accent-ink">order_id</code>.
      </>
    ),
    signal: 3,
    tone: "var(--green)",
    label: "High confidence",
    cta: "Accept",
    ctaStyle: "bg-accent text-white",
  },
  {
    key: "review",
    body: (
      <>
        Incremental (windowed) with watermark{" "}
        <code className="rounded-md bg-orange-tint px-1.5 py-0.5 font-mono text-[12px] text-orange">refresh_date</code>{" "}
        and 7-day lookback.
      </>
    ),
    signal: 2,
    tone: "var(--orange)",
    label: "Needs review",
    cta: "Configure",
    ctaStyle: "bg-ink text-canvas",
  },
  {
    key: "none",
    body: (
      <>
        No usable watermark detected. Falling back to{" "}
        <span className="font-medium text-ink">full refresh</span>.
      </>
    ),
    signal: 0,
    tone: "var(--ink-3)",
    label: "No signal",
    cta: "Accept full refresh",
    ctaStyle: "bg-ink text-canvas",
  },
];

export default function RecommendationCard() {
  const [index, setIndex] = useState(0);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    const advance = setTimeout(() => setSwapping(true), STATE_MS - SWAP_MS);
    const swap = setTimeout(() => {
      setIndex((i) => (i + 1) % STATES.length);
      setSwapping(false);
    }, STATE_MS);
    return () => {
      clearTimeout(advance);
      clearTimeout(swap);
    };
  }, [index]);

  const state = STATES[index];

  return (
    <div className="w-full max-w-95 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">
            Smart sync recommendation
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <p
          className="mt-1.5 min-h-9 text-[13px] leading-relaxed text-ink-2 transition-[opacity,filter] duration-250"
          style={{
            opacity: swapping ? 0 : 1,
            filter: swapping ? "blur(3px)" : "blur(0)",
          }}
        >
          {state.body}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line bg-inset px-3.5 py-2">
        {/* confidence meter */}
        <span
          className="flex items-center gap-2 transition-[opacity,filter] duration-250"
          style={{ opacity: swapping ? 0 : 1, filter: swapping ? "blur(2px)" : "blur(0)" }}
        >
          <span className="flex items-end gap-0.5">
            {[0, 1, 2].map((bar) => (
              <span
                key={bar}
                className="w-1 rounded-full transition-colors duration-300"
                style={{
                  height: 10,
                  background: bar < state.signal ? state.tone : "var(--line-strong)",
                }}
              />
            ))}
          </span>
          <span className="text-[12.5px] font-medium text-ink-2">{state.label}</span>
        </span>

        <span className="flex items-center gap-2">
          <button className="h-7 rounded-control bg-surface px-2.5 text-[12.5px] font-medium text-ink shadow-btn transition-colors duration-100 hover:bg-hover">
            Alternatives
          </button>
          <button
            className={`h-7 rounded-control px-3 text-[12.5px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_rgba(16,24,40,0.12),0_1px_2px_rgba(16,24,40,0.1)]
              transition-[opacity,filter] duration-250 ${state.ctaStyle}`}
            style={{ opacity: swapping ? 0.5 : 1, filter: swapping ? "blur(1px)" : "blur(0)" }}
          >
            {state.cta}
          </button>
        </span>
      </div>
    </div>
  );
}
