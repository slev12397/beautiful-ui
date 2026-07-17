"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * SEARCH — command search with live filtering
 *
 *     0ms   default list under the input
 *   900ms   "Dra" types in — list filters live, × appears
 *  2400ms   clears, "Quantum" types — empty state
 *  5200ms   clears, resets
 * Rows hover inside 4px gutters; the input row tints on
 * hover; the × really clears in a live implementation.
 * ───────────────────────────────────────────────────────── */

const ITEMS = [
  "Summarize this thread",
  "Draft follow-up email",
  "Extract action items",
  "Compare to last quarter",
  "Translate to Spanish",
  "Generate test cases",
  "Explain this error",
];

const SCRIPT: { text: string; hold: number }[] = [
  { text: "", hold: 1100 },
  { text: "Dra", hold: 1500 },
  { text: "Quantum", hold: 2200 },
];

const CHAR_MS = 90;

export default function SearchList() {
  const [phase, setPhase] = useState(0);
  const [chars, setChars] = useState(0);
  const target = SCRIPT[phase].text;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (chars < target.length) {
      t = setTimeout(() => setChars((c) => c + 1), CHAR_MS);
    } else {
      t = setTimeout(() => {
        setPhase((p) => (p + 1) % SCRIPT.length);
        setChars(0);
      }, SCRIPT[phase].hold);
    }
    return () => clearTimeout(t);
  }, [chars, phase, target]);

  const query = target.slice(0, chars);
  const results = query
    ? ITEMS.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
    : ITEMS.slice(0, 5);
  const empty = query.length > 2 && results.length === 0;

  return (
    <div className="flex min-h-[248px] w-full max-w-72 flex-col items-stretch">
      <div className="w-full self-start overflow-hidden rounded-card bg-surface shadow-raised">
        {/* input row */}
        <div className="flex h-10 items-center gap-2 border-b border-line px-3 transition-colors duration-100 hover:bg-hover">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span className="min-w-0 flex-1 text-[13px]">
            {query ? (
              <span className="text-ink">
                {query}
                <span className="ml-px inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-ink" />
              </span>
            ) : (
              <span className="text-ink-3">Search actions…</span>
            )}
          </span>
          {query && (
            <button
              aria-label="Clear search"
              className="flex size-5.5 items-center justify-center rounded-full text-ink-3
                transition-colors duration-100 hover:bg-line/70 hover:text-ink"
              style={{ animation: "fade-in 150ms ease-out both" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* results / empty state */}
        {empty ? (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-8" style={{ animation: "fade-in 250ms ease-out both" }}>
            <span className="mb-1.5 flex size-8 items-center justify-center rounded-control bg-inset text-ink-3 shadow-hairline">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <span className="text-[13px] font-medium text-ink">No results found</span>
            <span className="text-[12px] text-ink-3">Adjust your search to try again</span>
          </div>
        ) : (
          <div className="p-1">
            {results.map((item) => (
              <button
                key={item}
                className="flex h-8 w-full items-center rounded-[6px] px-2 text-left text-[13px]
                  text-ink transition-colors duration-100 hover:bg-hover"
                style={{ animation: "fade-in 200ms ease-out both" }}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
