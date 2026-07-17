"use client";

import { Liveline, type HoverPoint, type LivelinePoint, type LivelineSeries } from "liveline";
import { useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────
 * INSIGHT CARDS
 * Embedded mini-visualizations in an "Insights N ‹ ›"
 * carousel. Autoplay yields as soon as a person uses it.
 * ───────────────────────────────────────────────────────── */

const PAGE_MS = 3400;
const SWAP_MS = 250;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const WINDOWS = [
  { label: "15s", secs: 15 },
  { label: "30s", secs: 30 },
  { label: "1m", secs: 60 },
];

const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
const formatMoney = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const nowSeconds = () => Math.floor(Date.now() / 1000);

function makePoints(values: number[], gap = 2): LivelinePoint[] {
  const now = nowSeconds();
  return values.map((value, index) => ({
    time: now - (values.length - 1 - index) * gap,
    value,
  }));
}

function nextPoint(points: LivelinePoint[], value: number) {
  const last = points.at(-1);
  return {
    time: Math.max(nowSeconds(), (last?.time ?? nowSeconds()) + 1),
    value: Math.round(value * 100) / 100,
  };
}

/* inline @entity mention */
function Entity({ name, tone }: { name: string; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-baseline font-medium text-ink">
      <span className={`inline-block size-2.5 rounded-full ${tone}`} />
      @{name}
    </span>
  );
}

function Mono({ children, tone }: { children: React.ReactNode; tone: "red" | "green" }) {
  return (
    <code className={`font-mono text-[11.5px] ${tone === "red" ? "text-red" : "text-green"}`}>
      {children}
    </code>
  );
}

/* 1 — return comparison: 2 series, legend + big deltas + line chart */
function CompareCard() {
  const [paused, setPaused] = useState(false);
  const [windowSecs, setWindowSecs] = useState(30);
  const [hover, setHover] = useState<HoverPoint | null>(null);
  const [data, setData] = useState(() => ({
    mint: makePoints([-2.9, -3.4, -3.05, -3.86, -3.52, -4.1, -3.82, -4.41]),
    pistachio: makePoints([0.22, 0.58, 0.42, 0.91, 0.76, 1.08, 0.96, 1.15]),
  }));

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setData((current) => {
        const index = current.mint.length;
        const mintLast = current.mint.at(-1)?.value ?? -4.41;
        const pistachioLast = current.pistachio.at(-1)?.value ?? 1.15;
        return {
          mint: [
            ...current.mint.slice(-52),
            nextPoint(current.mint, mintLast + Math.sin(index * 0.74) * 0.18 - 0.03),
          ],
          pistachio: [
            ...current.pistachio.slice(-52),
            nextPoint(current.pistachio, pistachioLast + Math.cos(index * 0.62) * 0.08 + 0.02),
          ],
        };
      });
    }, 950);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const t = setTimeout(() => setPaused(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const latestMint = data.mint.at(-1)?.value ?? -4.41;
  const latestPistachio = data.pistachio.at(-1)?.value ?? 1.15;
  const series: LivelineSeries[] = useMemo(
    () => [
      {
        id: "mint",
        label: "Mint Chip",
        data: data.mint,
        value: latestMint,
        color: "#f68f3c",
      },
      {
        id: "pistachio",
        label: "Pistachio",
        data: data.pistachio,
        value: latestPistachio,
        color: "#3d9aff",
      },
    ],
    [data.mint, data.pistachio, latestMint, latestPistachio],
  );

  return (
    <div className="rounded-card bg-surface p-3 shadow-hairline">
      <div className="flex items-center gap-4">
        {[
          {
            name: "Mint Chip",
            delta: formatPercent(latestMint),
            sub: "-$2,377.66",
            tone: "red",
            dot: "bg-orange",
          },
          {
            name: "Pistachio",
            delta: formatPercent(latestPistachio),
            sub: "+$617.22",
            tone: "green",
            dot: "bg-accent",
          },
        ].map((s) => (
          <div key={s.name} className="flex-1">
            <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
              <span className={`size-2 rounded-full ${s.dot}`} />
              {s.name}
            </span>
            <span className={`block text-[17px] font-semibold tracking-[-0.01em] tabular-nums ${s.tone === "red" ? "text-red" : "text-green"}`}>
              {s.delta}
            </span>
            <Mono tone={s.tone as "red" | "green"}>{s.sub}</Mono>
          </div>
        ))}
      </div>
      <div className="mt-2 overflow-hidden rounded-control bg-inset shadow-hairline">
        <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
          <span className="text-[11px] text-ink-3 tabular-nums">
            {hover ? formatPercent(hover.value) : "Scrub chart"}
          </span>
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="rounded-full px-2 py-0.5 text-[10.5px] font-medium text-ink-2
              transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>
        <div className="h-[104px]">
          <Liveline
            data={[]}
            value={0}
            series={series}
            theme="dark"
            grid
            scrub
            pulse
            exaggerate
            window={windowSecs}
            windows={WINDOWS}
            onWindowChange={setWindowSecs}
            windowStyle="rounded"
            seriesToggleCompact
            paused={paused}
            cursor="crosshair"
            lineWidth={2.25}
            padding={{ top: 12, right: 12, bottom: 24, left: 10 }}
            formatValue={formatPercent}
            formatTime={(time) => new Date(time * 1000).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
            onHover={setHover}
          />
        </div>
      </div>
    </div>
  );
}

/* 2 — anomaly: bars with threshold + big spent value */
function AnomalyCard() {
  const [paused, setPaused] = useState(false);
  const [windowSecs, setWindowSecs] = useState(30);
  const [metric, setMetric] = useState<"spend" | "usage">("spend");
  const [hover, setHover] = useState<HoverPoint | null>(null);
  const [spend, setSpend] = useState(() =>
    makePoints([274, 289, 264, 307, 331, 1210, 1718, 2112], 3),
  );
  const [usage, setUsage] = useState(() =>
    makePoints([18, 19, 17, 21, 22, 58, 81, 96], 3),
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setSpend((current) => {
        const index = current.length;
        const last = current.at(-1)?.value ?? 2112;
        const next = Math.max(240, last + Math.sin(index * 0.66) * 78 - 12);
        return [...current.slice(-46), nextPoint(current, next)];
      });
      setUsage((current) => {
        const index = current.length;
        const last = current.at(-1)?.value ?? 96;
        const next = Math.max(14, last + Math.cos(index * 0.7) * 4.5 - 0.5);
        return [...current.slice(-46), nextPoint(current, next)];
      });
    }, 1050);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const t = setTimeout(() => setPaused(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const data = metric === "spend" ? spend : usage;
  const value = data.at(-1)?.value ?? (metric === "spend" ? 2112 : 96);
  const threshold = metric === "spend" ? 2112 : 82;
  const moneyLabel = formatMoney(spend.at(-1)?.value ?? 2112);

  return (
    <div className="rounded-card bg-surface p-3 shadow-hairline">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          High freezer spend
        </span>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11.5px] text-ink-2
            transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
        >
          {paused ? "Resume" : "Pause"}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
        </button>
      </div>
      <div className="mt-2 overflow-hidden rounded-control bg-inset shadow-hairline">
        <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
          <span className="text-[11px] text-ink-3 tabular-nums">
            {hover
              ? metric === "spend"
                ? formatMoney(hover.value)
                : `${Math.round(hover.value)} kWh`
              : `${metric === "spend" ? "$2,112" : "82 kWh"} threshold`}
          </span>
          <span className="flex rounded-full bg-field p-0.5">
            {(["spend", "usage"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={metric === item}
                onClick={() => setMetric(item)}
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.96] ${
                  metric === item ? "bg-surface text-ink shadow-btn" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                {item === "spend" ? "Spend" : "Usage"}
              </button>
            ))}
          </span>
        </div>
        <div className="h-[104px]">
          <Liveline
            data={data}
            value={value}
            theme="dark"
            color="#ee5c61"
            grid
            scrub
            badge
            badgeVariant="minimal"
            fill
            pulse
            momentum
            exaggerate
            showValue
            valueMomentumColor
            paused={paused}
            window={windowSecs}
            windows={WINDOWS}
            onWindowChange={setWindowSecs}
            windowStyle="rounded"
            referenceLine={{ value: threshold, label: metric === "spend" ? "threshold" : "peak limit" }}
            lineWidth={2.25}
            cursor="crosshair"
            padding={{ top: 12, right: 58, bottom: 24, left: 10 }}
            formatValue={(v) => (metric === "spend" ? formatMoney(v) : `${Math.round(v)} kWh`)}
            formatTime={(time) => new Date(time * 1000).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })}
            onHover={setHover}
          />
        </div>
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
          {moneyLabel} spent
        </span>
        <Mono tone="red">+$1,834.66</Mono>
        <span className="text-[11px] text-ink-3">vs 3 months</span>
      </div>
    </div>
  );
}

/* 3 — allocation: hero number + segmented bar + legend */
function AllocationCard() {
  const segments = [
    { name: "VAN", label: "Vanilla", pct: 72.5, amount: "$51,785", cls: "bg-orange", tone: "text-orange" },
    { name: "CHOC", label: "Chocolate", pct: 22.8, amount: "$16,278", cls: "bg-line-strong", tone: "text-ink-2" },
    { name: "MINT", label: "Mint", pct: 4.7, amount: "$3,357", cls: "bg-line", tone: "text-ink-3" },
  ];
  const [selected, setSelected] = useState(segments[0].name);
  const active = segments.find((segment) => segment.name === selected) ?? segments[0];

  return (
    <div className="rounded-card bg-surface p-3 shadow-hairline">
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
        <span className="flex size-3.5 items-center justify-center rounded-full bg-orange text-[8px] font-bold text-white">
          V
        </span>
        Vanilla allocation
      </span>
      <span className="mt-1 block text-[20px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
        {active.amount}
      </span>
      <div
        className="mt-2 flex h-7 gap-0.5 overflow-hidden rounded-full bg-field p-0.5"
        role="group"
        aria-label="Allocation segments"
      >
        {segments.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected === s.name}
            aria-label={`${s.label}: ${s.pct}%`}
            onClick={() => setSelected(s.name)}
            className={`relative h-full overflow-hidden rounded-full ${s.cls} transition-[opacity,transform,box-shadow] duration-300 active:scale-[0.98]`}
            style={{
              width: `${s.pct}%`,
              opacity: selected === s.name ? 1 : 0.58,
              boxShadow: selected === s.name ? "inset 0 0 0 1px rgba(255,255,255,0.22)" : undefined,
              transitionTimingFunction: EASE,
            }}
          >
            <span
              className="absolute inset-y-1 left-1 rounded-full bg-white/20 transition-[width,opacity] duration-500"
              style={{
                width: selected === s.name ? "calc(100% - 8px)" : "0%",
                opacity: selected === s.name ? 1 : 0,
                transitionTimingFunction: EASE,
              }}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {segments.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={selected === s.name}
            onClick={() => setSelected(s.name)}
            className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
              selected === s.name ? "bg-field text-ink" : "text-ink-2 hover:bg-hover hover:text-ink"
            }`}
          >
            <span className={`size-1.5 rounded-full ${s.cls}`} />
            {s.name} <span className="tabular-nums">{s.pct}%</span>
          </button>
        ))}
      </div>
      <div className="mt-2 min-h-8 rounded-control bg-inset px-2.5 py-1.5 shadow-hairline">
        <span className={`block text-[11.5px] font-medium ${active.tone}`}>{active.label}</span>
        <span className="block text-[11px] text-ink-3">
          Click segments to inspect contribution without changing the card height.
        </span>
      </div>
    </div>
  );
}

const PAGES = [
  {
    key: "compare",
    prose: (
      <>
        The worst performer in your <Entity name="Creamery" tone="bg-orange" /> is
        Rocky Road — down <Mono tone="red">-6%</Mono> or <Mono tone="red">-$2,453.44</Mono>.
      </>
    ),
    Card: CompareCard,
    pill: "Should I rebalance flavors?",
  },
  {
    key: "anomaly",
    prose: (
      <>
        Unusually high freezer bill on <span className="font-medium text-ink">Dec 13</span> —{" "}
        <Mono tone="red">+$1,834.66</Mono> above your average.
      </>
    ),
    Card: AnomalyCard,
    pill: "Get tips on cutting freezer costs",
  },
  {
    key: "allocation",
    prose: (
      <>
        You&apos;re heavily invested in <Entity name="Vanilla" tone="bg-orange" /> — it&apos;s{" "}
        <span className="font-medium text-ink">72.5%</span> of your case.
      </>
    ),
    Card: AllocationCard,
    pill: "If we look at seasonals, what changes?",
  },
];

export default function InsightCards() {
  const [page, setPage] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual) return;
    const fade = setTimeout(() => setSwapping(true), PAGE_MS - SWAP_MS);
    const next = setTimeout(() => {
      setPage((p) => (p + 1) % PAGES.length);
      setSwapping(false);
    }, PAGE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(next);
    };
  }, [manual, page]);

  const move = (direction: -1 | 1) => {
    setManual(true);
    setSwapping(false);
    setPage((current) => (current + direction + PAGES.length) % PAGES.length);
  };

  const { prose, Card, pill } = PAGES[page];

  return (
    <div className="min-h-[320px] w-full max-w-80">
      {/* pager header */}
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold text-ink">Insights</span>
          <span className="text-[13px] text-ink-3 tabular-nums">{PAGES.length}</span>
        </span>
        <span className="flex items-center gap-0.5">
          {(["M15 18l-6-6 6-6", "M9 6l6 6-6 6"] as const).map((d, i) => (
            <button
              key={i}
              aria-label={i === 0 ? "Previous insight" : "Next insight"}
              onClick={() => move(i === 0 ? -1 : 1)}
              className="flex size-6 items-center justify-center rounded-[6px] text-ink-3
                transition-[background-color,color,transform] duration-100 hover:bg-hover
                hover:text-ink active:scale-[0.96]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            </button>
          ))}
        </span>
      </div>

      {/* page content — blurred crossfade */}
      <div
        className="transition-[opacity,filter] duration-250"
        style={{ opacity: swapping ? 0 : 1, filter: swapping ? "blur(3px)" : "blur(0)" }}
      >
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{prose}</p>
        <div className="mt-2">
          <Card />
        </div>
        <button
          className="mt-2 rounded-full bg-surface px-3 py-1.5 text-left text-[12px] text-ink
            shadow-btn transition-colors duration-100 hover:bg-hover"
        >
          {pill}
        </button>
      </div>
    </div>
  );
}
