"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * DIFF TABLE — storyboard
 *
 *     0ms   plain table
 *   800ms   AI SUGGESTION badge + outline on pending row
 *  1800ms   two rows tint red (to deactivate)
 *  2800ms   new row slides in green (to add)
 *  5600ms   settle back to plain, reset
 * ───────────────────────────────────────────────────────── */

function useStage(steps: number[]) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setStage((s) => (s + 1) % steps.length),
      steps[stage],
    );
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

const ROWS = [
  { id: "EMP002", dept: "Sales", email: "j.ford@acme.com", removed: true },
  { id: "EMP023", dept: "Engineering", email: "k.turner@acme.com", removed: true },
  { id: "EMP061", dept: "HR", email: "d.roberts@acme.com", removed: false },
];

const DOT: Record<string, string> = {
  Sales: "bg-accent",
  Engineering: "bg-ink-3",
  HR: "bg-orange",
};

export default function DiffTable() {
  const stage = useStage([800, 1000, 1000, 2800, 600]);
  // 0 plain · 1 badge · 2 red tint · 3 green row in · 4 settle
  const badge = stage >= 1 && stage < 4;
  const tinted = stage >= 2 && stage < 4;
  const added = stage >= 3 && stage < 4;

  return (
    <div className="w-full max-w-95">
      <div className="relative overflow-hidden rounded-card bg-surface shadow-card">
        {/* AI suggestion badge */}
        <span
          className="absolute top-1.5 right-3 z-10 inline-flex h-5 items-center rounded-md
            bg-accent px-1.5 text-[10px] font-semibold tracking-wide text-white
            transition-[opacity,transform] duration-300"
          style={{
            opacity: badge ? 1 : 0,
            transform: badge ? "translateY(0)" : "translateY(-4px)",
            transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          AI SUGGESTION
        </span>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {["Employee", "Department", "Email"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-[12px] font-medium text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const out = row.removed && tinted;
              return (
                <tr
                  key={row.id}
                  className="border-b border-line transition-colors duration-400 last:border-0 hover:bg-hover"
                  style={{ background: out ? "var(--red-tint)" : undefined }}
                >
                  <td
                    className="px-3 py-2.5 text-[13px] font-medium tabular-nums transition-colors duration-400"
                    style={{ color: out ? "var(--red)" : "var(--ink)" }}
                  >
                    {row.id}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-inset px-2 text-[11.5px] font-medium shadow-hairline transition-opacity duration-400"
                      style={{ opacity: out ? 0.55 : 1 }}
                    >
                      <span className={`size-1.5 rounded-full ${DOT[row.dept]}`} />
                      <span className="text-ink-2">{row.dept}</span>
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 text-[12.5px] whitespace-nowrap transition-colors duration-400"
                    style={{
                      color: out ? "var(--red)" : "var(--ink-2)",
                      textDecorationLine: out ? "line-through" : "none",
                      textDecorationColor: "color-mix(in srgb, var(--red) 50%, transparent)",
                    }}
                  >
                    {row.email}
                  </td>
                </tr>
              );
            })}
            {/* added row */}
            <tr>
              <td colSpan={3} className="p-0">
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-400"
                  style={{
                    gridTemplateRows: added ? "1fr" : "0fr",
                    opacity: added ? 1 : 0,
                    transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="overflow-hidden" style={{ background: "var(--green-tint)" }}>
                    <div className="flex items-center border-t border-line">
                      <span className="px-3 py-2.5 text-[13px] font-medium text-green tabular-nums">
                        EMP074
                      </span>
                      <span className="px-3 py-2.5">
                        <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-surface px-2 text-[11.5px] font-medium shadow-hairline">
                          <span className="size-1.5 rounded-full bg-green" />
                          <span className="text-ink-2">HR</span>
                        </span>
                      </span>
                      <span className="px-3 py-2.5 text-[13px] text-green">
                        m.lopez@acme.com
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
