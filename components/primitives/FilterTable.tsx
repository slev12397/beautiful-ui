"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * FILTER TABLE — storyboard
 * Status chips act as live filters over the task table.
 *
 *     0ms   "All" active, full table
 *  2200ms   "To do" selects — other rows collapse away
 *  4400ms   "In Progress" selects
 *  6600ms   back to "All", hold, repeat
 * ───────────────────────────────────────────────────────── */

type Status = "todo" | "progress" | "done";

const FILTERS: { key: "all" | Status; label: string; dot?: string; count: number }[] = [
  { key: "all", label: "All", count: 5 },
  { key: "todo", label: "To do", dot: "bg-red", count: 2 },
  { key: "progress", label: "In Progress", dot: "bg-accent", count: 2 },
  { key: "done", label: "Completed", dot: "bg-green", count: 1 },
];

const ROWS: { task: string; date: string; status: Status; owner: string }[] = [
  { task: "Restock vanilla", date: "Dec 03", status: "todo", owner: "B. Gelato" },
  { task: "Churn pistachio", date: "Sep 22", status: "progress", owner: "E. Cone" },
  { task: "Print menu boards", date: "Jan 02", status: "todo", owner: "K. Sundae" },
  { task: "Taste-test batch 42", date: "Nov 08", status: "progress", owner: "S. Sprinkle" },
  { task: "Order waffle cones", date: "Apr 14", status: "done", owner: "J. Fudge" },
];

const PILLS: Record<Status, { label: string; cls: string }> = {
  todo: { label: "To do", cls: "bg-red-tint text-red" },
  progress: { label: "In Progress", cls: "bg-accent-tint text-accent-ink" },
  done: { label: "Completed", cls: "bg-green-tint text-green" },
};

const SEQUENCE: ("all" | Status)[] = ["all", "todo", "progress"];

export default function FilterTable() {
  const [step, setStep] = useState(0);
  const filter = SEQUENCE[step];

  useEffect(() => {
    const t = setTimeout(() => setStep((s) => (s + 1) % SEQUENCE.length), 2200);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="w-full max-w-105">
      {/* filter chips */}
      <div className="mb-2 flex items-center gap-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              className={`flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-[12px]
                font-medium transition-[background-color,box-shadow,color] duration-200
                ${active ? "bg-surface text-ink shadow-btn" : "text-ink-2 hover:bg-hover"}`}
            >
              {f.dot && <span className={`size-1.5 rounded-full ${f.dot}`} />}
              {f.label}
              <span
                className={`rounded-[4px] px-1 text-[10.5px] tabular-nums
                  ${active ? "bg-field text-ink-2" : "text-ink-3"}`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="grid grid-cols-[1.3fr_0.6fr_0.95fr_0.9fr] border-b border-line px-3 py-2 text-[11.5px] font-medium text-ink-3">
          <span>Task name</span>
          <span>Date</span>
          <span>Status</span>
          <span>Advisor</span>
        </div>
        {ROWS.map((row) => {
          const shown = filter === "all" || row.status === filter;
          const pill = PILLS[row.status];
          return (
            <div
              key={row.task}
              className="grid transition-[grid-template-rows,opacity] duration-300"
              style={{
                gridTemplateRows: shown ? "1fr" : "0fr",
                opacity: shown ? 1 : 0,
                transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <div className="overflow-hidden">
                <div
                  className="grid grid-cols-[1.3fr_0.6fr_0.95fr_0.9fr] items-center border-b
                    border-line px-3 py-2 text-[12px] transition-colors duration-100
                    last:border-0 hover:bg-hover"
                >
                  <span className="truncate font-medium text-ink">{row.task}</span>
                  <span className="text-ink-2 tabular-nums">{row.date}</span>
                  <span>
                    <span
                      className={`inline-flex h-5 items-center rounded-[5px] px-1.5
                        text-[11px] font-medium ${pill.cls}`}
                    >
                      {pill.label}
                    </span>
                  </span>
                  <span className="truncate text-ink-2">{row.owner}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
