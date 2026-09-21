"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * EMAIL CAPTURE — signup for updates + new components. Posts
 * to /api/subscribe, which saves the email as a Resend Contact
 * (API key stays server-side). The form is shared between the
 * end-of-page section and the click-nudge modal.
 * ───────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DONE_KEY = "bui-email-nudge";
type Status = "idle" | "loading" | "done" | "error";

function markDone() {
  try {
    localStorage.setItem(DONE_KEY, "done");
  } catch {
    /* ignore */
  }
}

function EmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const valid = EMAIL_RE.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("bad status");
      markDone();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <h2 className="max-w-md text-[19px] leading-snug font-semibold tracking-[-0.02em] text-ink text-balance">
        New components, in your inbox.
      </h2>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-2 text-pretty">
        Get new primitives and updates as they ship — copy-paste ready. No spam,
        unsubscribe anytime.
      </p>

      {status === "done" ? (
        <div
          className="mt-5 flex items-center gap-2 text-[13px] font-medium text-ink"
          style={{ animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both" }}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-green text-white">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          You’re on the list — talk soon.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 flex max-w-md flex-col gap-1.5" noValidate>
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 flex-1 items-center rounded-control bg-inset px-3 transition-shadow duration-150"
              style={{
                boxShadow:
                  status === "error"
                    ? "0 0 0 1px var(--red)"
                    : "var(--shadow-hairline)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mr-2 shrink-0">
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <path d="m3 6 9 6 9-6" />
              </svg>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@studio.com"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
              />
            </div>
            <button
              type="submit"
              disabled={!valid || status === "loading"}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-control bg-ink px-3.5 text-[12.5px]
                font-medium text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(16,24,40,0.1)]
                transition-[opacity,transform] duration-150 enabled:active:scale-[0.97] disabled:opacity-40"
            >
              {status === "loading" ? (
                <>
                  <span className="size-3.5 rounded-full border-[1.5px] border-canvas/40 border-t-canvas" style={{ animation: "spin 700ms linear infinite" }} />
                  Joining
                </>
              ) : (
                <>
                  Notify me
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>
          {status === "error" && (
            <p className="text-[12px] text-red" style={{ animation: "fade-in 150ms ease-out both" }}>
              Something went wrong — try again.
            </p>
          )}
        </form>
      )}
    </>
  );
}

/** End-of-page signup section. */
export function EmailCapture() {
  return (
    <section className="px-5 py-12 sm:px-8 sm:py-14">
      <EmailForm />
    </section>
  );
}

/** The same signup, in a fork-modal-style dialog (opened by the click nudge). */
export function EmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      aria-label="Get new components in your inbox"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/55"
        style={{ animation: "fade-in 200ms ease-out both" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[460px] overflow-hidden rounded-window bg-surface shadow-overlay"
        style={{ animation: "pop-in 250ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 flex size-8 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <div className="px-6 pt-6 pb-7">
          <EmailForm />
        </div>
      </div>
    </div>
  );
}
