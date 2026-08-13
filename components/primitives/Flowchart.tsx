"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * FLOWCHART — an agent workflow on a dotted editor canvas.
 * Two steps: a Trigger card and an If/Else condition card,
 * joined by a measured connector. Nodes are real controls
 * (click the trigger to select it; its edge lights up).
 * ───────────────────────────────────────────────────────── */

const PURPLE = "#9a5cff";
const AMBER = "#f09a2f";

const mix = (hue: string, pct: number, base = "var(--surface)") =>
  `color-mix(in srgb, ${hue} ${pct}%, ${base})`;

/* ── layout constants ── */
const PAD_Y = 28;
const ROW_GAP = 76;
const PILL_OFFSET = 36; // kind pill + gap above a card

type StepNode = {
  id: string;
  row: number;
  x: number; // 0–1 center of the node
  w: number;
  kind?: { label: string; hue: string };
  icon?: "cone";
  hue?: string;
  title?: string;
  caption?: string;
  condition?: boolean; // renders the if/else chip rows instead
};

type FlowEdge = { from: string; to: string; label?: string; at?: number };

const NODES: StepNode[] = [
  {
    id: "trigger",
    row: 0,
    x: 0.5,
    w: 350,
    kind: { label: "Trigger", hue: PURPLE },
    icon: "cone",
    hue: PURPLE,
    title: "New order created",
    caption: "Trigger when a new order is created",
  },
  {
    id: "cond",
    row: 1,
    x: 0.5,
    w: 400,
    kind: { label: "If / Else", hue: AMBER },
    condition: true,
  },
];

const EDGES: FlowEdge[] = [{ from: "trigger", to: "cond" }];

/* estimated heights for the first paint; measured immediately after */
const EST_H: Record<string, number> = { trigger: 116, cond: 164 };

/* ── icons ── */
function ConeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11" />
      <path d="M17 7A5 5 0 0 0 7 7" />
      <path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-3">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Handle() {
  return (
    <svg width="11" height="18" viewBox="0 0 11 18" className="shrink-0 text-ink-3/70">
      {[4, 9, 14].flatMap((y) => [
        <circle key={`l${y}`} cx="3.2" cy={y} r="1.2" fill="currentColor" />,
        <circle key={`r${y}`} cx="8" cy={y} r="1.2" fill="currentColor" />,
      ])}
    </svg>
  );
}

/* ── chips used inside the condition card ── */
function SourceChip() {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[8px] bg-ink px-2 text-[13px] font-medium text-canvas">
      <ConeIcon size={13} />
      order
    </span>
  );
}

function SelectChip({ children, value }: { children: React.ReactNode; value?: boolean }) {
  return (
    <button
      type="button"
      className="inline-flex h-7 min-w-0 cursor-pointer items-center gap-1.5 rounded-[8px] bg-field px-2
        text-[13px] font-medium text-ink transition-colors duration-100 hover:bg-hover-2"
    >
      {value && <span className="size-2 shrink-0 rounded-full" style={{ background: AMBER }} />}
      <span className="min-w-0 truncate">{children}</span>
      <Chevron />
    </button>
  );
}

function ConditionBody() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-2">
        <Handle />
        <span className="w-8 text-[14px] text-ink-2">If</span>
        <SourceChip />
        <SelectChip>flavor</SelectChip>
        <span className="text-[14px] text-ink-2">is</span>
        <SelectChip value>Rocky Road</SelectChip>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
        <Handle />
        <span className="w-8 text-[14px] text-ink-2">and</span>
        <SourceChip />
        <SelectChip>topping</SelectChip>
        <span className="text-[14px] text-ink-2">is</span>
        <span className="max-w-full pl-[61px]">
          <SelectChip value>Brown butter bourbon brittle crunch</SelectChip>
        </span>
      </div>
    </div>
  );
}

function StepBody({ node }: { node: StepNode }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-[10px]"
        style={{
          background: mix(node.hue!, 12),
          color: node.hue,
          boxShadow: `0 0 0 1px ${mix(node.hue!, 20)}`,
        }}
      >
        <ConeIcon />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-[15px] font-semibold text-ink">{node.title}</span>
        <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-2">{node.caption}</span>
      </span>
    </div>
  );
}

/* ── the canvas ── */
export default function Flowchart() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>(EST_H);
  const [selected, setSelected] = useState<string | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measure = () => {
      setWidth(canvas.clientWidth);
      setHeights((prev) => {
        const next = { ...prev };
        let changed = false;
        nodeRefs.current.forEach((el, id) => {
          const h = el.offsetHeight;
          if (h && Math.abs(h - (next[id] ?? 0)) > 0.5) {
            next[id] = h;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    nodeRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* rows → y offsets from measured node heights */
  const rows = [...new Set(NODES.map((n) => n.row))].sort((a, b) => a - b);
  const rowH = rows.map((r) =>
    Math.max(...NODES.filter((n) => n.row === r).map((n) => heights[n.id] ?? 80)),
  );
  const rowY: number[] = [];
  rows.forEach((_, i) => {
    rowY[i] = i === 0 ? PAD_Y : rowY[i - 1] + rowH[i - 1] + ROW_GAP;
  });
  const canvasH = rowY[rows.length - 1] + rowH[rows.length - 1] + PAD_Y;

  const cw = width || 480;
  const place = (n: StepNode) => {
    const w = Math.min(n.w, cw * (NODES.filter((m) => m.row === n.row).length > 1 ? 0.45 : 0.92));
    return { w, cx: n.x * cw, top: rowY[rows.indexOf(n.row)] };
  };

  /* card anchor points (pills sit above the card, so offset the top) */
  const anchors = (n: StepNode) => {
    const { cx, top } = place(n);
    return {
      top: { x: cx, y: top + (n.kind ? PILL_OFFSET : 0) },
      bottom: { x: cx, y: top + (heights[n.id] ?? 80) },
    };
  };

  const bezier = (edge: FlowEdge) => {
    const from = anchors(NODES.find((n) => n.id === edge.from)!).bottom;
    const to = anchors(NODES.find((n) => n.id === edge.to)!).top;
    const k = Math.min(Math.max((to.y - from.y) * 0.55, 24), 84);
    const point = (t: number) => {
      const u = 1 - t;
      const px =
        u * u * u * from.x + 3 * u * u * t * from.x + 3 * u * t * t * to.x + t * t * t * to.x;
      const py =
        u * u * u * from.y +
        3 * u * u * t * (from.y + k) +
        3 * u * t * t * (to.y - k) +
        t * t * t * to.y;
      return { x: px, y: py };
    };
    return {
      d: `M ${from.x} ${from.y} C ${from.x} ${from.y + k}, ${to.x} ${to.y - k}, ${to.x} ${to.y}`,
      label: point(edge.at ?? 0.5),
    };
  };

  const isLit = (edge: FlowEdge) => selected === edge.from || selected === edge.to;

  return (
    <div
      ref={canvasRef}
      className="relative w-full overflow-hidden rounded-card bg-page shadow-hairline"
      style={{
        height: canvasH,
        backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1.25px)",
        backgroundSize: "22px 22px",
        backgroundPosition: "center",
      }}
    >
      {/* connectors */}
      <svg width={cw} height={canvasH} className="pointer-events-none absolute inset-0">
        {EDGES.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}`}
            d={bezier(edge).d}
            fill="none"
            stroke={isLit(edge) ? "var(--accent)" : "var(--line-strong)"}
            strokeWidth="1.25"
            className="transition-[stroke] duration-150"
          />
        ))}
      </svg>

      {/* edge labels */}
      {EDGES.filter((e) => e.label).map((edge) => {
        const { label } = bezier(edge);
        return (
          <span
            key={`label-${edge.from}-${edge.to}`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-[5px] bg-page px-1.5 py-0.5
              text-[11.5px] transition-colors duration-150 ${isLit(edge) ? "text-accent-ink" : "text-ink-3"}`}
            style={{ left: label.x, top: label.y }}
          >
            {edge.label}
          </span>
        );
      })}

      {/* nodes */}
      {NODES.map((node) => {
        const { w, cx, top } = place(node);
        const active = selected === node.id;
        return (
          <div
            key={node.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(node.id, el);
              else nodeRefs.current.delete(node.id);
            }}
            className="absolute flex -translate-x-1/2 flex-col items-start gap-2"
            style={{ left: cx, top, width: w }}
          >
            {node.kind && (
              <span
                className="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12.5px] font-medium"
                style={{
                  background: mix(node.kind.hue, 14, "var(--page)"),
                  color: mix(node.kind.hue, 80, "var(--ink)"),
                }}
              >
                {node.kind.label}
              </span>
            )}
            {node.condition ? (
              <div className="w-full rounded-window bg-surface shadow-card">
                <ConditionBody />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelected(active ? null : node.id)}
                aria-pressed={active}
                className="w-full cursor-pointer rounded-window bg-surface text-left outline-none
                  transition-shadow duration-150 focus-visible:shadow-[0_0_0_1.5px_var(--accent)]"
                style={{
                  boxShadow: active
                    ? "0 0 0 1.5px var(--accent), 0 2px 10px rgba(0,0,0,0.045)"
                    : "var(--shadow-card)",
                }}
              >
                <StepBody node={node} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
