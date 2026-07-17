"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * WELCOME MODAL — storyboard
 * Trial onboarding where the agent has prepared the setup.
 *
 *     0ms   modal pops in, title + lead
 *   400ms   setup card rows stagger in, trial pill pops
 *  2200ms   CTA presses
 *  2900ms   billing toggle flips on
 *  6400ms   reset
 * ───────────────────────────────────────────────────────── */

export default function WelcomeModal() {
  const [cycle, setCycle] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [billing, setBilling] = useState(false);

  useEffect(() => {
    const press = setTimeout(() => setPressed(true), 2200);
    const release = setTimeout(() => setPressed(false), 2450);
    const toggle = setTimeout(() => setBilling(true), 2900);
    const reset = setTimeout(() => {
      setBilling(false);
      setCycle((c) => c + 1);
    }, 6400);
    return () => {
      clearTimeout(press);
      clearTimeout(release);
      clearTimeout(toggle);
      clearTimeout(reset);
    };
  }, [cycle]);

  return (
    <div
      key={cycle}
      className="w-full max-w-72 overflow-hidden rounded-window bg-surface shadow-overlay"
      style={{ animation: "pop-in 350ms cubic-bezier(0.23,1,0.32,1) both" }}
    >
      <div className="px-3.5 pt-3.5 pb-3">
        {/* close */}
        <div className="flex items-start justify-between">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Welcome to Pipeline
          </h3>
          <button
            aria-label="Close"
            className="-mt-0.5 -mr-1 flex size-6 items-center justify-center rounded-[6px]
              text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-ink-2">
          <span className="font-medium text-ink">Your workspace is ready</span> —
          trial active.
        </p>

        {/* setup */}
        <p className="mt-2.5 text-[11.5px] text-ink-3">Your setup</p>
        <div className="mt-1 overflow-hidden rounded-card shadow-hairline">
          <div
            className="flex items-center gap-2.5 bg-surface px-2.5 py-1.5"
            style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) 300ms both" }}
          >
            <span className="flex size-7 items-center justify-center rounded-control bg-ink text-surface">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium text-ink">Acme Inc</span>
              <span className="block truncate text-[11.5px] text-ink-3">
                pipeline.com/acme
              </span>
            </span>
            <span
              className="rounded-[5px] bg-accent-tint px-1.5 py-0.5 text-[11px] font-medium text-accent-ink"
              style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) 700ms both" }}
            >
              7-day trial
            </span>
          </div>
          <div
            className="flex items-center gap-2 border-t border-line bg-inset px-2.5 py-1.5"
            style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) 450ms both" }}
          >
            <span className="flex size-4.5 items-center justify-center rounded-[5px] bg-accent text-white">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
              </svg>
            </span>
            <span className="text-[11.5px] font-medium text-ink">AI-detected deals</span>
            <span className="flex-1 truncate text-[11.5px] whitespace-nowrap text-ink-2 tabular-nums">
              56 deals
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* CTA */}
        <button
          className="mt-2.5 h-8 w-full rounded-control bg-ink text-[12.5px] font-medium
            text-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(16,24,40,0.1)]
            transition-[transform,opacity] duration-150 hover:opacity-90"
          style={{ transform: pressed ? "scale(0.98)" : "scale(1)" }}
        >
          Start using Pipeline
        </button>
        <p className="mt-1.5 truncate text-center text-[11px] text-ink-3">
          No card required today.
        </p>
      </div>

      {/* billing footer */}
      <div className="flex items-center justify-between border-t border-line bg-inset px-3.5 py-2">
        <span>
          <span className="flex items-center gap-1.5">
            <span className="text-[12px] font-medium text-ink">Billing setup</span>
            <span className="rounded-[4px] bg-field px-1 py-px text-[10.5px] text-ink-2 shadow-hairline">
              Optional
            </span>
          </span>
          <span className="block text-[11px] text-ink-3">
            Add your card now to skip paywalls later
          </span>
        </span>
        <button
          role="switch"
          aria-checked={billing}
          aria-label="Billing setup"
          className="relative h-4.5 w-8 shrink-0 rounded-full transition-colors duration-200"
          style={{ background: billing ? "var(--green)" : "var(--line-strong)" }}
        >
          <span
            className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]
              transition-transform duration-200"
            style={{
              transform: billing ? "translateX(14px)" : "translateX(0)",
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
