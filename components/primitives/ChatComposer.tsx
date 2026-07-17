"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * CHAT — storyboard (panel with tabs, reasoning replies,
 * and a composer; layout from the AI Project design system)
 *
 *     0ms   idle panel, placeholder in composer
 *   700ms   prompt types in (~40ms/char)
 *   then    send arms, presses — message lifts into the
 *           right-aligned bubble
 *  +400ms   reply section 1 streams in (header, then body)
 *  +1600ms  section 2 appears small + gray, then resolves
 *   hold    3s, reset
 * ───────────────────────────────────────────────────────── */

const PROMPT = "Compare mint chip to last summer";
const CHAR_MS = 40;

type Phase = "idle" | "typing" | "armed" | "sent" | "reply1" | "reply2" | "done";

function Section({
  label,
  sub,
  time,
  body,
  resolving,
}: {
  label: string;
  sub: string;
  time: string;
  body: string;
  resolving?: boolean;
}) {
  return (
    <div
      className="flex w-full flex-col gap-1.5 transition-[opacity,filter,transform] duration-400"
      style={{
        opacity: resolving ? 0.55 : 1,
        filter: resolving ? "blur(0.5px)" : "blur(0)",
        transform: resolving ? "scale(0.985)" : "scale(1)",
        transformOrigin: "top left",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <div className="flex items-center gap-1 text-[12px] leading-[1.3]">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-ink-2">{sub}</span>
        <span className="text-ink">for {time}</span>
      </div>
      <p className="text-[13px] leading-normal text-ink">{body}</p>
    </div>
  );
}

export default function ChatComposer() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [chars, setChars] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "idle") t = setTimeout(() => setPhase("typing"), 700);
    else if (phase === "typing") {
      if (chars < PROMPT.length)
        t = setTimeout(() => setChars((c) => c + 1), CHAR_MS);
      else t = setTimeout(() => setPhase("armed"), 300);
    } else if (phase === "armed") t = setTimeout(() => setPhase("sent"), 500);
    else if (phase === "sent") t = setTimeout(() => setPhase("reply1"), 500);
    else if (phase === "reply1") t = setTimeout(() => setPhase("reply2"), 1400);
    else if (phase === "reply2") t = setTimeout(() => setPhase("done"), 1200);
    else
      t = setTimeout(() => {
        setPhase("idle");
        setChars(0);
      }, 3000);
    return () => clearTimeout(t);
  }, [phase, chars]);

  const sent = phase !== "idle" && phase !== "typing" && phase !== "armed";
  const typed = PROMPT.slice(0, chars);

  return (
    <div className="flex min-h-[248px] w-full max-w-95 flex-col self-start overflow-hidden rounded-card bg-surface shadow-raised">
      {/* header — tabs + actions */}
      <div className="flex items-center justify-between border-b border-line p-1.5">
        <div className="flex items-center">
          <span className="rounded-[6px] bg-field px-2 py-[3px] text-[13px] text-ink">
            Flavors
          </span>
          <span className="cursor-pointer rounded-[6px] px-2 py-[3px] text-[13px] text-ink opacity-50 transition-opacity duration-100 hover:opacity-75">
            Suppliers
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[
            <path key="p" d="M12 5v14M5 12h14" />,
            <g key="h"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g>,
            <g key="e" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></g>,
          ].map((icon, i) => (
            <button
              key={i}
              aria-label="Action"
              className="flex size-6 items-center justify-center rounded-[6px] text-ink-3
                transition-colors duration-100 hover:bg-hover hover:text-ink-2"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {icon}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* conversation */}
      <div className="flex flex-col gap-2.5 px-3 pt-2.5 pb-1">
        {/* user bubble — right aligned, soft block */}
        <div className="flex justify-end pl-14">
          <div
            className="rounded-xl bg-field px-3 py-1.5 text-[13px] leading-[1.4] text-ink
              transition-[opacity,transform] duration-300"
            style={{
              opacity: sent ? 1 : 0,
              transform: sent ? "translateY(0)" : "translateY(10px)",
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            {PROMPT}
          </div>
        </div>

        {phase === "reply1" || phase === "reply2" || phase === "done" ? (
          <Section
            label="Sales History"
            sub="Flavor Data"
            time="4s"
            body="Pulled 3 summers of mint chip sales for comparison."
          />
        ) : null}
        {phase === "reply2" || phase === "done" ? (
          <Section
            label="Comparison"
            sub="Trend Detection"
            time="2s"
            body="Mint chip is up 12% with stronger weekend peaks."
            resolving={phase === "reply2"}
          />
        ) : null}
      </div>

      {/* composer */}
      <div className="mt-auto p-1.5">
        <div className="flex flex-col gap-2 rounded-control border border-line bg-field p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="min-h-4.5 text-[13px] leading-[1.4]">
            {!sent && typed.length > 0 ? (
              <span className="text-ink">
                {typed}
                <span className="ml-px inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-ink" />
              </span>
            ) : (
              <span className="text-ink-3">Prompt or tag a flavor with @</span>
            )}
          </div>
          <div className="flex items-center justify-end">
            <button
              aria-label="Send"
              className="flex size-6 items-center justify-center rounded-full
                transition-[background-color,color,transform] duration-200"
              style={{
                background:
                  phase === "armed" ? "var(--ink)" : "var(--line-strong)",
                color: phase === "armed" ? "var(--surface)" : "var(--ink-2)",
                transform: phase === "sent" ? "scale(0.92)" : "scale(1)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
