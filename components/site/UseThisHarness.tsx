"use client";

import { useEffect, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────
 * USE THIS HARNESS
 * A "take this and run" modal for the open-source harness.
 * The primary action copies a ready-to-paste prompt the user
 * hands to their coding agent; a secondary row offers the raw
 * git clone + repo link for people who'd rather do it by hand.
 * ───────────────────────────────────────────────────────── */

const REPO_URL = "https://github.com/slev12397/beautiful-ui";
const CLONE_CMD = `git clone ${REPO_URL}.git`;

const AGENT_PROMPT = `Add the Beautiful UI agent harness to my app.

Source (MIT, Next.js + Tailwind v4): ${REPO_URL}

1. Clone the repo (or read its raw files) and copy into my project:
   - components/primitives/*: the UI primitives (thinking state, streaming
     text, approvals, tool chips, records/diff tables, prompt bar, etc.)
   - components/site/IceCreamHarness.tsx: the chat shell that arranges them
   - the design tokens in app/globals.css (the :root, .dark, and @theme blocks)
   - fonts: Inter + JetBrains Mono via next/font (see app/layout.tsx)

2. Install the deps it uses: tailwindcss v4, plus @central-icons-react for the
   sidebar icons (a commercial set, so set CENTRAL_LICENSE_KEY from
   centralicons.com, or swap those icons for your own). The sounds (cuelume)
   and dev dial tuning (dialkit) are optional; drop them if you don't want
   them, and remove the posthog analytics calls.

3. Wire the harness to MY agent: replace the demo SCENARIOS in
   IceCreamHarness.tsx with calls to my backend. Keep the primitives as the
   rendering layer for my agent's thinking, streaming, tool calls, and
   approvals.

4. Keep the design system intact: the tokens, the radii (chip 6 / control 8 /
   card 10 / window 14), hairline borders, and restrained shadows.

Before writing any code, ask me for my stack and how my agent's API works.`;

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return { copied, copy };
}

function Icon({ path, size = 15, sw = 1.9 }: { path: ReactNode; size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {path}
    </svg>
  );
}

const glyph = {
  copy: <g><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></g>,
  check: <path d="M20 6L9 17l-5-5" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  external: <g><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /></g>,
};

export function UseThisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const prompt = useCopy();
  const clone = useCopy();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Fork this harness"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/55"
        style={{ animation: "fade-in 200ms ease-out both" }}
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[85vh] w-full max-w-[520px] flex-col overflow-hidden rounded-window bg-surface shadow-overlay"
        style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-ink">Fork this harness</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2 text-pretty">
              This whole harness is open source: every primitive, the design tokens, and the
              sounds. The fastest way to drop it into your agent product is to hand these
              instructions to your coding agent.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
          >
            <Icon path={glyph.close} size={15} sw={2.2} />
          </button>
        </div>

        {/* body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <div className="mb-2 text-[11.5px] font-medium tracking-wide text-ink-3 uppercase">
            Give this to your agent
          </div>

          <div className="overflow-hidden rounded-card bg-inset shadow-hairline">
            <pre className="max-h-52 overflow-y-auto px-3.5 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-ink-2">
              {AGENT_PROMPT}
            </pre>
          </div>

          <button
            type="button"
            onClick={() => prompt.copy(AGENT_PROMPT)}
            className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-control bg-ink text-[13px] font-medium text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(16,24,40,0.12)] transition-transform duration-150 active:scale-[0.99]"
          >
            <Icon path={prompt.copied ? glyph.check : glyph.copy} size={15} sw={prompt.copied ? 2.4 : 1.9} />
            {prompt.copied ? "Copied to clipboard" : "Copy instructions"}
          </button>

          {/* secondary — clone it yourself */}
          <div className="mt-5 mb-2 text-[11.5px] font-medium tracking-wide text-ink-3 uppercase">
            Or clone it yourself
          </div>

          <div className="flex items-center gap-2 rounded-control bg-inset px-3 py-2 shadow-hairline">
            <span className="text-ink-3"><Icon path={<g><path d="M4 17l6-6-6-6" /><path d="M12 19h8" /></g>} size={14} sw={2} /></span>
            <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-2">{CLONE_CMD}</code>
            <button
              type="button"
              aria-label="Copy clone command"
              onClick={() => clone.copy(CLONE_CMD)}
              className={`flex size-7 shrink-0 items-center justify-center rounded-[7px] transition-colors duration-150 hover:bg-hover ${clone.copied ? "text-green" : "text-ink-3 hover:text-ink"}`}
            >
              <Icon path={clone.copied ? glyph.check : glyph.copy} size={14} sw={clone.copied ? 2.4 : 1.9} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
            <span className="text-[12px] text-ink-3">MIT licensed · works with Claude Code, Cursor, and any coding agent.</span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-field px-2.5 py-1.5 text-[12px] font-medium text-ink shadow-btn transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.97]"
            >
              GitHub
              <Icon path={glyph.external} size={13} sw={2} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
