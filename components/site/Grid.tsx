"use client";

import { useCallback, useEffect, useState } from "react";
import { REGISTRY, type Entry } from "@/lib/registry";

/* ─────────────────────────────────────────────────────────
 * GRID + CODE OVERLAY
 * Demos run live and are directly interactable. Each card
 * has explicit actions: copy the source, or view the code.
 * ───────────────────────────────────────────────────────── */

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}

function useCopy(code: string) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, [code]);
  return { copied, copy };
}

function Card({
  entry,
  code,
  index,
  onOpen,
}: {
  entry: Entry;
  code: string;
  index: number;
  onOpen: () => void;
}) {
  const { Demo } = entry;
  const { copied, copy } = useCopy(code);
  const [variant, setVariant] = useState(entry.variants?.[0]);

  return (
    <div
      className="group flex w-full flex-col"
      style={{
        animation: `fade-up 600ms cubic-bezier(0.23,1,0.32,1) ${index * 60}ms both`,
      }}
    >
      <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-window bg-canvas p-5 shadow-hairline">
        <div className="w-full max-w-120 [&>*]:mx-auto">
          <Demo variant={variant} />
        </div>
        {entry.variants && (
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 rounded-full bg-field p-0.5">
            {entry.variants.map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium transition-[background-color,color,box-shadow] duration-150
                  ${variant === v ? "bg-surface text-ink shadow-btn" : "text-ink-3 hover:text-ink-2"}`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
        <div
          className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 transition-opacity
            duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <button
            aria-label="Copy code"
            onClick={copy}
            className={`flex size-7 items-center justify-center rounded-control bg-surface
              shadow-btn transition-colors duration-100 hover:bg-hover
              ${copied ? "text-green" : "text-ink-3 hover:text-ink"}`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            aria-label="View code"
            onClick={onOpen}
            className="flex size-7 items-center justify-center rounded-control bg-surface
              text-ink-3 shadow-btn transition-colors duration-100
              hover:bg-hover hover:text-ink"
          >
            <CodeIcon />
          </button>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 px-1.5 pt-2.5 pb-1">
        <h3 className="shrink-0 text-[12.5px] font-medium text-ink">
          {entry.title}
        </h3>
        <p className="truncate text-[12.5px] text-ink-3">{entry.caption}</p>
      </div>
    </div>
  );
}

function Overlay({
  entry,
  code,
  onClose,
}: {
  entry: Entry;
  code: string;
  onClose: () => void;
}) {
  const { copied, copy } = useCopy(code);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.title} code`}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/55"
        style={{ animation: "fade-in 200ms ease-out both" }}
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden
          rounded-window bg-surface shadow-overlay"
        style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-ink">{entry.title}</h3>
            <p className="truncate font-mono text-[11.5px] text-ink-3">
              components/{entry.file}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={copy}
              className="flex h-7 items-center gap-1.5 rounded-control bg-ink px-2.5
                text-[12.5px] font-medium text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(16,24,40,0.1)]
                transition-transform duration-150 active:scale-[0.98]"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              aria-label="Close"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-control text-ink-3
                transition-colors duration-150 hover:bg-hover hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto bg-inset p-4 font-mono text-[12px] leading-relaxed text-ink-2">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function Grid({ sources }: { sources: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = REGISTRY.find((e) => e.id === openId);

  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-5 gap-y-7 px-6 md:grid-cols-2">
        {REGISTRY.map((entry, i) => (
          <Card
            key={entry.id}
            entry={entry}
            code={sources[entry.id] ?? ""}
            index={i}
            onOpen={() => setOpenId(entry.id)}
          />
        ))}
      </div>
      {open && (
        <Overlay
          entry={open}
          code={sources[open.id] ?? ""}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
