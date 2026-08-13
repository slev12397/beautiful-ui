"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * FLOWCHART — an agent workflow graph on a dotted canvas.
 * Nodes are real controls (click to select; incident edges
 * light up). Connectors are measured beziers, so the graph
 * stays crisp at any width. Attio/Plain-style editor look:
 * category pills, tinted icon tiles, labeled branches.
 * ───────────────────────────────────────────────────────── */

const PURPLE = "#9a5cff";
const AMBER = "#f09a2f";

const mix = (hue: string, pct: number, base = "var(--surface)") =>
  `color-mix(in srgb, ${hue} ${pct}%, ${base})`;

/* ── layout constants ── */
const PAD_Y = 24;
const ROW_GAP = 54;
const PILL_OFFSET = 26; // kind pill + gap above a card

type StepNode = {
  id: string;
  row: number;
  x: number; // 0–1 center of the node
  w: number;
  kind?: { label: string; hue: string };
  icon?: "ticket" | "clock" | "send";
  hue?: string;
  title?: string;
  caption?: string;
  chip?: { label: string; initials?: string };
  condition?: boolean; // renders the if/else chip rows instead
};

type FlowEdge = { from: string; to: string; label?: string; at?: number };

const NODES: StepNode[] = [
  {
    id: "trigger",
    row: 0,
    x: 0.5,
    w: 300,
    kind: { label: "Trigger", hue: PURPLE },
    icon: "ticket",
    hue: PURPLE,
    title: "New ticket created",
    caption: "Trigger when a new ticket is created",
  },
  {
    id: "cond",
    row: 1,
    x: 0.5,
    w: 330,
    kind: { label: "If / Else", hue: AMBER },
    condition: true,
  },
  {
    id: "send",
    row: 2,
    x: 0.26,
    w: 216,
    icon: "send",
    hue: "var(--accent)",
    title: "Send DM message",
    caption: "Send confirmation to",
    chip: { label: "Requester" },
  },
  {
    id: "wait",
    row: 2,
    x: 0.74,
    w: 216,
    icon: "clock",
    hue: AMBER,
    title: "Wait for approval",
    caption: "Wait for approval from",
    chip: { label: "Kevin Coleman", initials: "KC" },
  },
];

const EDGES: FlowEdge[] = [
  { from: "trigger", to: "cond" },
  { from: "cond", to: "send", label: "otherwise", at: 0.62 },
  { from: "cond", to: "wait", label: "then", at: 0.62 },
];

/* estimated heights for the first paint; measured immediately after */
const EST_H: Record<string, number> = { trigger: 88, cond: 130, send: 66, wait: 66 };

/* ── icons ── */
function Icon({ name, size = 16 }: { name: "ticket" | "clock" | "send"; size?: number }) {
  const paths = {
    ticket: (
      <>
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2M13 11v2M13 17v2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-ink-3">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Handle() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" className="shrink-0 text-ink-3/70">
      {[3, 8, 13].flatMap((y) => [
        <circle key={`l${y}`} cx="3" cy={y} r="1.1" fill="currentColor" />,
        <circle key={`r${y}`} cx="7.5" cy={y} r="1.1" fill="currentColor" />,
      ])}
    </svg>
  );
}

/* ── chips used inside the condition card ── */
function SourceChip() {
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[6px] bg-ink px-1.5 text-[11.5px] font-medium text-canvas">
      <Icon name="ticket" size={11} />
      ticket
    </span>
  );
}

function SelectChip({ children, value }: { children: React.ReactNode; value?: boolean }) {
  return (
    <button
      type="button"
      className="inline-flex h-6 min-w-0 cursor-pointer items-center gap-1 rounded-[6px] bg-field px-1.5
        text-[12px] font-medium text-ink transition-colors duration-100 hover:bg-hover-2"
    >
      {value && (
        <span className="shrink-0" style={{ color: AMBER }}>
          <Icon name="clock" size={11} />
        </span>
      )}
      <span className="min-w-0 truncate">{children}</span>
      <Chevron />
    </button>
  );
}

function ConditionBody() {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <Handle />
        <span className="w-6 text-[12.5px] text-ink-2">If</span>
        <SourceChip />
        <SelectChip>status</SelectChip>
        <span className="text-[12.5px] text-ink-2">is</span>
        <SelectChip value>in progress</SelectChip>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5">
        <Handle />
        <span className="w-6 text-[12.5px] text-ink-2">and</span>
        <SourceChip />
        <SelectChip>If condition</SelectChip>
        <span className="text-[12.5px] text-ink-2">is</span>
        <span className="max-w-full pl-[46px]">
          <SelectChip value>Too long name that doesn&apos;t fit</SelectChip>
        </span>
      </div>
    </div>
  );
}

function StepBody({ node }: { node: StepNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[8px]"
        style={{
          background: mix(node.hue!, 12),
          color: node.hue,
          boxShadow: `0 0 0 1px ${mix(node.hue!, 22)}`,
        }}
      >
        <Icon name={node.icon!} />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-[13px] font-semibold text-ink">{node.title}</span>
        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 text-[12px] leading-tight text-ink-2">
          <span>{node.caption}</span>
          {node.chip && (
            <span className="inline-flex h-[18px] min-w-0 shrink-0 items-center gap-1 rounded-full bg-field px-1.5 text-[11px] font-medium text-ink-2">
              {node.chip.initials && (
                <span
                  className="flex size-3 shrink-0 items-center justify-center rounded-full text-[6.5px] font-semibold text-white"
                  style={{ background: mix("#c84f9d", 85, "var(--ink)") }}
                >
                  {node.chip.initials}
                </span>
              )}
              <span className="truncate">{node.chip.label}</span>
            </span>
          )}
        </span>
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
    Math.max(...NODES.filter((n) => n.row === r).map((n) => heights[n.id] ?? 66)),
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
      bottom: { x: cx, y: top + (heights[n.id] ?? 66) },
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
        backgroundSize: "16px 16px",
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
            className="absolute flex -translate-x-1/2 flex-col items-start gap-1.5"
            style={{ left: cx, top, width: w }}
          >
            {node.kind && (
              <span
                className="inline-flex h-5 items-center rounded-[6px] px-1.5 text-[11px] font-medium"
                style={{
                  background: mix(node.kind.hue, 14, "var(--page)"),
                  color: mix(node.kind.hue, 80, "var(--ink)"),
                }}
              >
                {node.kind.label}
              </span>
            )}
            <button
              type="button"
              onClick={() => setSelected(active ? null : node.id)}
              aria-pressed={active}
              className="w-full cursor-pointer rounded-card bg-surface text-left outline-none
                transition-shadow duration-150 focus-visible:shadow-[0_0_0_1.5px_var(--accent)]"
              style={{
                boxShadow: active
                  ? "0 0 0 1.5px var(--accent), 0 2px 10px rgba(0,0,0,0.045)"
                  : "var(--shadow-card)",
              }}
            >
              {node.condition ? <ConditionBody /> : <StepBody node={node} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
