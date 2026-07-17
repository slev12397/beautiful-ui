"use client";

import { useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * RECORDS TABLE — Attio-style CRM grid.
 * Sortable columns, hover rows, checkbox selection, tag
 * chips, and relationship-strength status dots.
 * ───────────────────────────────────────────────────────── */

type Strength = "strong" | "weak" | "veryweak" | "none";

const STRENGTH: Record<Strength, { label: string; dot: string; rank: number }> = {
  strong: { label: "Very strong", dot: "var(--green)", rank: 3 },
  weak: { label: "Weak", dot: "var(--orange)", rank: 2 },
  veryweak: { label: "Very weak", dot: "var(--red)", rank: 1 },
  none: { label: "No orders", dot: "var(--ink-3)", rank: 0 },
};

/* small categorical tag palette — soft tints, brand-adjacent */
const TAGS: Record<string, string> = {
  Dairy: "bg-accent-tint text-accent-ink",
  Organic: "bg-green-tint text-green",
  Ingredients: "bg-orange-tint text-orange",
  Packaging: "text-[#7a5af0]",
  Equipment: "bg-inset text-ink-2",
  Toppings: "text-[#c2418a]",
  Import: "bg-inset text-ink-2",
  Local: "bg-green-tint text-green",
};

function Tag({ name }: { name: string }) {
  const isTint = TAGS[name]?.startsWith("bg-");
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded-[5px] px-1.5 text-[11px] font-medium ${TAGS[name] ?? "bg-inset text-ink-2"}`}
      style={isTint ? undefined : { background: "color-mix(in srgb, currentColor 12%, transparent)" }}
    >
      {name}
    </span>
  );
}

type Row = {
  name: string;
  tags: string[];
  last: string;
  strength: Strength;
};

const ROWS: Row[] = [
  { name: "Alpine Dairy Co.", tags: ["Dairy", "Organic"], last: "9 days ago", strength: "strong" },
  { name: "Verde Farms", tags: ["Dairy", "Local"], last: "3 weeks ago", strength: "strong" },
  { name: "Cone Kings", tags: ["Packaging"], last: "2 months ago", strength: "weak" },
  { name: "Sprinkle Labs", tags: ["Toppings", "Ingredients"], last: "15 days ago", strength: "weak" },
  { name: "Madagascar Vanilla", tags: ["Ingredients", "Import"], last: "over 1 year ago", strength: "veryweak" },
  { name: "Sweet Labs", tags: ["Ingredients"], last: "5 months ago", strength: "veryweak" },
  { name: "FreezeTech", tags: ["Equipment"], last: "No orders", strength: "none" },
];

type SortKey = "name" | "strength";

export default function RecordsTable() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });

  const rows = useMemo(() => {
    const withIndex = ROWS.map((r, i) => ({ r, i }));
    withIndex.sort((a, b) => {
      const v =
        sort.key === "name"
          ? a.r.name.localeCompare(b.r.name)
          : STRENGTH[a.r.strength].rank - STRENGTH[b.r.strength].rank;
      return v * sort.dir;
    });
    return withIndex;
  }, [sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));

  const allSel = selected.size === ROWS.length;

  const Head = ({ label, k, icon }: { label: string; k?: SortKey; icon: React.ReactNode }) => (
    <button
      type="button"
      onClick={k ? () => toggleSort(k) : undefined}
      className={`group/h flex h-full min-w-0 items-center gap-1.5 px-2.5 text-[11.5px] font-medium text-ink-3 ${k ? "hover:text-ink-2" : "cursor-default"}`}
    >
      <span className="shrink-0 text-ink-3">{icon}</span>
      <span className="truncate">{label}</span>
      {k && (
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-opacity duration-100 ${sort.key === k ? "opacity-100" : "opacity-0 group-hover/h:opacity-40"}`}
          style={{ transform: sort.key === k && sort.dir === -1 ? "rotate(180deg)" : "none" }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-125 overflow-hidden rounded-card bg-surface shadow-card">
      {/* toolbar */}
      <div className="flex items-center justify-between border-b border-line px-2 py-1.5">
        <div className="flex items-center gap-1">
          <span className="flex h-7 items-center gap-1.5 rounded-control bg-surface px-2 text-[12px] font-medium text-ink shadow-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 3v18" /></svg>
            All suppliers
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
          {["Sort", "Filter"].map((t) => (
            <button key={t} type="button" className="flex h-7 items-center gap-1.5 rounded-control px-2 text-[12px] font-medium text-ink-2 transition-colors duration-100 hover:bg-hover hover:text-ink">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {t === "Sort" ? <path d="M8 6h13M8 12h9M8 18h5M3 8l3-3 3 3M6 5v14" /> : <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />}
              </svg>
              {t}
            </button>
          ))}
        </div>
        <button type="button" className="flex h-7 items-center gap-1 rounded-control bg-accent px-2.5 text-[12px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-150 active:scale-[0.97]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          New
        </button>
      </div>

      {/* header */}
      <div className="grid h-8 grid-cols-[28px_1.5fr_1.9fr_1fr] items-center border-b border-line">
        <label className="flex h-full items-center justify-center">
          <input
            type="checkbox"
            checked={allSel}
            onChange={() => setSelected(allSel ? new Set() : new Set(ROWS.map((_, i) => i)))}
            className="size-3.5 cursor-pointer accent-[var(--accent)]"
            aria-label="Select all"
          />
        </label>
        <Head label="Supplier" k="name" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01" /></svg>} />
        <Head label="Categories" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.6 13.4 12 22l-8-8V4h10l6.6 6.6a2 2 0 0 1 0 2.8zM7 7h.01" /></svg>} />
        <Head label="Relationship" k="strength" icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.9z" /></svg>} />
      </div>

      {/* rows */}
      <div>
        {rows.map(({ r, i }) => {
          const sel = selected.has(i);
          const s = STRENGTH[r.strength];
          return (
            <div
              key={r.name}
              className={`group/row grid h-10 grid-cols-[28px_1.5fr_1.9fr_1fr] items-center border-b border-line transition-colors duration-100 last:border-0 ${sel ? "bg-accent-tint/40" : "hover:bg-hover"}`}
            >
              <label className="flex h-full items-center justify-center">
                <input
                  type="checkbox"
                  checked={sel}
                  onChange={() =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      next.has(i) ? next.delete(i) : next.add(i);
                      return next;
                    })
                  }
                  aria-label={`Select ${r.name}`}
                  className={`size-3.5 cursor-pointer accent-[var(--accent)] transition-opacity duration-100 ${sel ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"}`}
                />
              </label>
              <div className="flex min-w-0 items-center gap-2 px-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-inset text-[10px] font-semibold text-ink-2 shadow-hairline">
                  {r.name[0]}
                </span>
                <span className="truncate text-[12.5px] font-medium text-ink">{r.name}</span>
              </div>
              <div className="flex min-w-0 items-center gap-1 overflow-hidden px-2.5">
                {r.tags.map((t) => (
                  <Tag key={t} name={t} />
                ))}
              </div>
              <div className="flex min-w-0 items-center gap-1.5 px-2.5">
                <span className="size-2 shrink-0 rounded-full" style={{ background: s.dot }} />
                <span className="truncate text-[12px] text-ink-2">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* footer count */}
      <div className="flex items-center gap-2 border-t border-line bg-inset px-3 py-1.5">
        <span className="text-[11.5px] text-ink-3 tabular-nums">
          {selected.size > 0 ? `${selected.size} selected` : `${ROWS.length} suppliers`}
        </span>
      </div>
    </div>
  );
}
