"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * APPROVAL CARD (human-in-the-loop) — storyboard
 * One question at a time; elongated pills show progress;
 * the circular arrow up top advances (↑ sends on the last).
 *
 * Per question: option selects → arrow presses → next
 * question slides in, pills advance. Ends on a sent state.
 * ───────────────────────────────────────────────────────── */

const QUESTIONS = [
  {
    q: "How long should the deck be?",
    type: "radio" as const,
    options: ["Brief (3–6 slides)", "Standard (7–12 slides)", "Exhaustive"],
    pick: [0],
  },
  {
    q: "What colors does the deck need?",
    type: "check" as const,
    options: ["Black", "Blue", "Orange"],
    pick: [0, 1],
  },
  {
    q: "Who is the audience?",
    type: "radio" as const,
    options: ["Executives", "Full team", "External clients"],
    pick: [1],
  },
];

// per-question beats: 0 idle · 1 picked · 2 arrow pressed
const BEAT_MS = [800, 800, 450];

export default function ApprovalCard() {
  const [step, setStep] = useState(0); // 3 beats per question, then sent hold
  const total = QUESTIONS.length * 3 + 1;

  useEffect(() => {
    const beat = step === total - 1 ? 3000 : BEAT_MS[step % 3];
    const t = setTimeout(() => setStep((s) => (s + 1) % total), beat);
    return () => clearTimeout(t);
  }, [step, total]);

  const sent = step === total - 1;
  const qi = Math.min(Math.floor(step / 3), QUESTIONS.length - 1);
  const beat = step % 3;
  const question = QUESTIONS[qi];
  const last = qi === QUESTIONS.length - 1;

  return (
    <div className="flex min-h-[196px] w-full max-w-80 flex-col items-stretch">
      <div className="w-full self-start overflow-hidden rounded-card bg-surface shadow-card">
        {sent ? (
          <div className="flex h-37 flex-col items-center justify-center gap-2">
            <span
              className="flex size-6 items-center justify-center rounded-full bg-green text-white"
              style={{ animation: "pop-in 300ms cubic-bezier(0.23,1,0.32,1) both" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <span className="text-[13px] font-medium text-ink" style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) 100ms both" }}>
              Answers sent
            </span>
          </div>
        ) : (
          <div key={qi} className="p-3.5" style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both" }}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13px] font-medium text-ink">{question.q}</span>
              <button
                aria-label="Dismiss"
                className="-mt-0.5 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-[6px]
                  text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-0.5">
              {question.options.map((option, i) => {
                const on = beat >= 1 && question.pick.includes(i);
                return (
                  <label key={option} className="-mx-1.5 flex cursor-pointer items-center gap-2 rounded-control px-1.5 py-1 transition-colors duration-100 hover:bg-hover">
                    <span className="w-3 text-center text-[11px] text-ink-3 tabular-nums">{i + 1}</span>
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center transition-colors duration-200
                        ${question.type === "radio" ? "rounded-full" : "rounded-[5px]"}
                        ${on ? "bg-ink text-canvas" : "shadow-[inset_0_0_0_1.5px_var(--line-strong)] text-transparent"}`}
                    >
                      {question.type === "radio" ? (
                        <span className="size-1.5 rounded-full bg-canvas transition-transform duration-200" style={{ transform: on ? "scale(1)" : "scale(0)" }} />
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      )}
                    </span>
                    <span className={`text-[13px] transition-colors duration-200 ${on ? "text-ink" : "text-ink-2"}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
              <div className="-mx-1.5 flex items-center gap-2 rounded-control px-1.5 py-1 transition-colors duration-100 hover:bg-hover">
                <span className="w-3 text-center text-[11px] text-ink-3 tabular-nums">0</span>
                <span className="text-[13px] text-ink-3">Type something…</span>
              </div>
            </div>
          </div>
        )}

        {/* footer — ring-dot pager + send arrow */}
        <div className="flex items-center justify-between px-2.5 pb-2.5">
          <span className="flex items-center gap-1.5">
            <button aria-label="Previous" className="flex size-5.5 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={
                  i === qi && !sent
                    ? { width: 10, height: 10, border: "2.5px solid var(--ink)" }
                    : sent || i < qi
                      ? { width: 7, height: 7, background: "var(--ink-3)" }
                      : { width: 7, height: 7, border: "1.5px solid var(--ink-3)" }
                }
              />
            ))}
            <button aria-label="Next" className="flex size-5.5 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </span>
          {!sent && (
            <button
              aria-label={last ? "Send answers" : "Next question"}
              className="flex size-7 items-center justify-center rounded-[8px] transition-[background-color,color,transform] duration-200"
              style={{
                background: beat >= 1 ? "var(--ink)" : "var(--field)",
                color: beat >= 1 ? "var(--surface)" : "var(--ink-3)",
                boxShadow: beat >= 1 ? "inset 0 1px 0 rgba(255,255,255,0.14)" : "var(--shadow-btn)",
                transform: beat === 2 ? "scale(0.92)" : "scale(1)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
