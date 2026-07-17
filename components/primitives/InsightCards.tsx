"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * INSIGHT CARDS — storyboard
 * Agent answers with embedded mini-visualizations, paged
 * through an "Insights N ‹ ›" carousel.
 *
 * Auto-advances comparison → anomaly → allocation every
 * 3.4s with a blurred crossfade; arrows show hover states.
 * ───────────────────────────────────────────────────────── */

const PAGE_MS = 3400;
const SWAP_MS = 250;

/* inline @entity mention */
function Entity({ name, tone }: { name: string; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-baseline font-medium text-ink">
      <span className={`inline-block size-2.5 rounded-full ${tone}`} />
      @{name}
    </span>
  );
}

function Mono({ children, tone }: { children: React.ReactNode; tone: "red" | "green" }) {
  return (
    <code className={`font-mono text-[11.5px] ${tone === "red" ? "text-red" : "text-green"}`}>
      {children}
    </code>
  );
}

/* 1 — return comparison: 2 series, legend + big deltas + line chart */
function CompareCard() {
  const a = "12,20 32,28 52,22 72,34 92,30 112,40 132,36 152,30 172,33 192,26 212,28 232,18";
  const b = "12,34 32,40 52,46 72,38 92,44 112,48 132,42 152,44 172,36 192,30 212,22 232,12";
  return (
    <div className="rounded-card bg-surface p-3 shadow-hairline">
      <div className="flex items-center gap-4">
        {[
          { name: "Robinhood", delta: "-4.41%", sub: "-$2,377.66", tone: "red", dot: "bg-orange" },
          { name: "Coinbase", delta: "+1.15%", sub: "+$617.22", tone: "green", dot: "bg-accent" },
        ].map((s) => (
          <div key={s.name} className="flex-1">
            <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
              <span className={`size-2 rounded-full ${s.dot}`} />
              {s.name}
            </span>
            <span className={`block text-[17px] font-semibold tracking-[-0.01em] tabular-nums ${s.tone === "red" ? "text-red" : "text-green"}`}>
              {s.delta}
            </span>
            <Mono tone={s.tone as "red" | "green"}>{s.sub}</Mono>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 244 56" className="mt-2 h-14 w-full">
        <line x1="192" y1="4" x2="192" y2="52" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 3" />
        <polyline points={a} fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={b} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="192" cy="26" r="3.5" fill="var(--orange)" stroke="var(--surface)" strokeWidth="2" />
        <circle cx="192" cy="30" r="3.5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* 2 — anomaly: bars with threshold + big spent value */
function AnomalyCard() {
  return (
    <div className="rounded-card bg-surface p-3 shadow-hairline">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          High transaction size
        </span>
        <span className="flex items-center gap-1 text-[11.5px] text-ink-2">
          View
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
        </span>
      </div>
      <svg viewBox="0 0 244 62" className="mt-2 h-15 w-full">
        <defs>
          <linearGradient id="anomaly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--red)" />
            <stop offset="70%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        {/* threshold + avg */}
        <line x1="0" y1="8" x2="196" y2="8" stroke="var(--red)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="244" y="11" textAnchor="end" fontSize="8.5" fill="var(--red)" fontFamily="var(--font-mono-face)">$2,112.00</text>
        <line x1="0" y1="38" x2="196" y2="38" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="2 3" />
        <text x="244" y="41" textAnchor="end" fontSize="8.5" fill="var(--ink-3)">$277 avg</text>
        {/* bars — anomaly carries status color */}
        <rect x="16" y="34" width="34" height="20" rx="4" fill="var(--accent-tint)" />
        <rect x="70" y="40" width="34" height="14" rx="4" fill="var(--accent-tint)" />
        <rect x="124" y="8" width="34" height="46" rx="4" fill="url(#anomaly)" />
        {["Oct", "Nov", "Dec"].map((m, i) => (
          <text key={m} x={33 + i * 54} y="61" textAnchor="middle" fontSize="8.5" fill="var(--ink-3)">{m}</text>
        ))}
      </svg>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
          $2,112.00 spent
        </span>
        <Mono tone="red">+$1,834.66</Mono>
        <span className="text-[11px] text-ink-3">vs 3 months</span>
      </div>
    </div>
  );
}

/* 3 — allocation: hero number + segmented bar + legend */
function AllocationCard() {
  const segments = [
    { name: "BTC", pct: 72.5, cls: "bg-orange" },
    { name: "ETH", pct: 22.8, cls: "bg-line-strong" },
    { name: "DOGE", pct: 4.7, cls: "bg-line" },
  ];
  return (
    <div className="rounded-card bg-surface p-3 shadow-hairline">
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
        <span className="flex size-3.5 items-center justify-center rounded-full bg-orange text-[8px] font-bold text-white">
          ₿
        </span>
        BTC allocation
      </span>
      <span className="mt-1 block text-[20px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
        $51,785
      </span>
      <div className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s) => (
          <span key={s.name} className={`h-full rounded-full ${s.cls}`} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3">
        {segments.map((s) => (
          <span key={s.name} className="flex items-center gap-1 text-[11px] text-ink-2">
            <span className={`size-1.5 rounded-full ${s.cls}`} />
            {s.name} <span className="tabular-nums">{s.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const PAGES = [
  {
    key: "compare",
    prose: (
      <>
        The worst performer in your <Entity name="Robinhood" tone="bg-orange" /> account
        is Bitcoin — down <Mono tone="red">-6%</Mono> or <Mono tone="red">-$2,453.44</Mono>.
      </>
    ),
    Card: CompareCard,
    pill: "If we look at diversification, what changes?",
  },
  {
    key: "anomaly",
    prose: (
      <>
        Unusually high transaction on <span className="font-medium text-ink">Dec 13</span> —{" "}
        <Mono tone="red">+$1,834.66</Mono> above your average.
      </>
    ),
    Card: AnomalyCard,
    pill: "Get tips on optimizing monthly spending",
  },
  {
    key: "allocation",
    prose: (
      <>
        You&apos;re heavily invested in <Entity name="Bitcoin" tone="bg-orange" /> — it&apos;s{" "}
        <span className="font-medium text-ink">72.5%</span> of your portfolio.
      </>
    ),
    Card: AllocationCard,
    pill: "Should I reallocate my BTC?",
  },
];

export default function InsightCards() {
  const [page, setPage] = useState(0);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setSwapping(true), PAGE_MS - SWAP_MS);
    const next = setTimeout(() => {
      setPage((p) => (p + 1) % PAGES.length);
      setSwapping(false);
    }, PAGE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(next);
    };
  }, [page]);

  const { prose, Card, pill } = PAGES[page];

  return (
    <div className="min-h-[218px] w-full max-w-80">
      {/* pager header */}
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold text-ink">Insights</span>
          <span className="text-[13px] text-ink-3 tabular-nums">{PAGES.length}</span>
        </span>
        <span className="flex items-center gap-0.5">
          {(["M15 18l-6-6 6-6", "M9 6l6 6-6 6"] as const).map((d, i) => (
            <button
              key={i}
              aria-label={i === 0 ? "Previous insight" : "Next insight"}
              onClick={() =>
                setPage((p) => (p + (i === 0 ? PAGES.length - 1 : 1)) % PAGES.length)
              }
              className="flex size-6 items-center justify-center rounded-[6px] text-ink-3
                transition-[background-color,color,transform] duration-100 hover:bg-hover
                hover:text-ink active:scale-[0.96]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            </button>
          ))}
        </span>
      </div>

      {/* page content — blurred crossfade */}
      <div
        className="transition-[opacity,filter] duration-250"
        style={{ opacity: swapping ? 0 : 1, filter: swapping ? "blur(3px)" : "blur(0)" }}
      >
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{prose}</p>
        <div className="mt-2">
          <Card />
        </div>
        <button
          className="mt-2 rounded-full bg-surface px-3 py-1.5 text-left text-[12px] text-ink
            shadow-btn transition-colors duration-100 hover:bg-hover"
        >
          {pill}
        </button>
      </div>
    </div>
  );
}
