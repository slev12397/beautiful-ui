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
              {/* arrow — advances, sends on the last question */}
              <button
                aria-label={last ? "Send answers" : "Next question"}
                className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-ink
                  text-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(16,24,40,0.1)]
                  transition-transform duration-150"
                style={{ transform: beat === 2 ? "scale(0.9)" : "scale(1)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {last ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M5 12h14M12 5l7 7-7 7" />}
                </svg>
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-0.5">
              {question.options.map((option, i) => {
                const on = beat >= 1 && question.pick.includes(i);
                return (
                  <label key={option} className="-mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-control px-1.5 py-1 transition-colors duration-100 hover:bg-hover">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center transition-colors duration-200
                        ${question.type === "radio" ? "rounded-full" : "rounded-[6px]"}
                        ${on ? "bg-ink text-canvas" : "shadow-[inset_0_0_0_1.5px_var(--line-strong)] text-transparent"}`}
                    >
                      {question.type === "radio" ? (
                        <span className="size-2 rounded-full bg-canvas transition-transform duration-200" style={{ transform: on ? "scale(1)" : "scale(0)" }} />
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                      )}
                    </span>
                    <span className={`text-[13px] transition-colors duration-200 ${on ? "text-ink" : "text-ink-2"}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* footer — progress pills + skip */}
        <div className="flex items-center justify-between bg-inset px-3.5 py-2">
          <span className="flex items-center gap-1">
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className="h-1 rounded-full transition-[background-color,width] duration-300"
                style={{
                  width: i === qi && !sent ? 18 : 10,
                  background:
                    sent || i < qi ? "var(--ink-3)" : i === qi ? "var(--ink)" : "var(--line-strong)",
                }}
              />
            ))}
          </span>
          {!sent && (
            <button className="h-6.5 rounded-control px-2 text-[12.5px] font-medium text-ink-2 transition-colors duration-100 hover:bg-hover hover:text-ink">
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
