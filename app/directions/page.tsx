import Link from "next/link";

const recOptions = [
  {
    id: "R1",
    title: "Single best action",
    caption: "One recommendation, one reason, one accept path.",
    Demo: SingleBestAction,
  },
  {
    id: "R2",
    title: "Ranked alternatives",
    caption: "Primary choice with scored backup options.",
    Demo: RankedAlternatives,
  },
  {
    id: "R3",
    title: "Rule inspector",
    caption: "Recommendation plus the rule that produced it.",
    Demo: RuleInspector,
  },
  {
    id: "R4",
    title: "Compare vendors",
    caption: "Recommended supplier against the next best supplier.",
    Demo: CompareVendors,
  },
  {
    id: "R5",
    title: "Decision log",
    caption: "Evidence → rule → recommendation → action.",
    Demo: DecisionLog,
  },
  {
    id: "R6",
    title: "What-if scorer",
    caption: "A small control surface for confidence changes.",
    Demo: WhatIfScorer,
  },
];

const diffOptions = [
  {
    id: "D1",
    title: "Minimal inline diff",
    caption: "Table stays familiar; only changed rows speak.",
    Demo: MinimalInlineDiff,
  },
  {
    id: "D2",
    title: "Attio-style table",
    caption: "Quiet CRM table with selection, status, and suggestions.",
    Demo: AttioStyleTable,
  },
  {
    id: "D3",
    title: "Before / after split",
    caption: "Fast comparison for a small set of changed values.",
    Demo: BeforeAfterSplit,
  },
  {
    id: "D4",
    title: "Review queue",
    caption: "Each proposed table mutation becomes an approval row.",
    Demo: ReviewQueue,
  },
  {
    id: "D5",
    title: "Cell-level diff",
    caption: "Precise field changes without leaving the table.",
    Demo: CellLevelDiff,
  },
  {
    id: "D6",
    title: "Collapsed summary",
    caption: "Compact mutation summary with expandable detail.",
    Demo: CollapsedSummary,
  },
];

function Pill({ tone = "neutral", children }: { tone?: "neutral" | "green" | "orange" | "red" | "blue"; children: React.ReactNode }) {
  const tones = {
    neutral: "bg-field text-ink-2 shadow-hairline",
    green: "bg-green-tint text-green",
    orange: "bg-orange-tint text-orange",
    red: "bg-red-tint text-red",
    blue: "bg-accent-tint text-accent-ink",
  };

  return (
    <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Bars({ score, tone = "var(--green)" }: { score: number; tone?: string }) {
  return (
    <span className="flex items-end gap-0.5">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-1 rounded-full"
          style={{
            height: 8 + bar * 3,
            background: bar < score ? tone : "var(--line-strong)",
          }}
        />
      ))}
    </span>
  );
}

function PrototypeCard({
  id,
  title,
  caption,
  children,
}: {
  id: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-[360px] flex-col rounded-window bg-canvas p-3 shadow-hairline">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] text-ink-3">{id}</span>
            <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
          </div>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-3">{caption}</p>
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-medium text-ink-3 shadow-btn">
          Direction
        </span>
      </div>
      <div className="flex flex-1 items-start justify-center">
        {children}
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  description,
  options,
}: {
  eyebrow: string;
  title: string;
  description: string;
  options: typeof recOptions;
}) {
  return (
    <section className="border-t border-dashed border-line py-12">
      <div className="mb-6 max-w-2xl">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-3">{eyebrow}</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink text-balance">{title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-2 text-pretty">{description}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {options.map(({ id, title: optionTitle, caption, Demo }) => (
          <PrototypeCard key={id} id={id} title={optionTitle} caption={caption}>
            <Demo />
          </PrototypeCard>
        ))}
      </div>
    </section>
  );
}

function SingleBestAction() {
  return (
    <div className="w-full max-w-86 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="primitive-card-pad">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-ink">Reorder waffle cones</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
              Agent recommends <span className="font-medium text-ink">Cone King</span> because current stockout risk is under 9 days.
            </p>
          </div>
          <Pill tone="green">92%</Pill>
        </div>
        <div className="mt-3 rounded-control bg-inset px-2.5 py-2 shadow-hairline">
          <span className="text-[11.5px] text-ink-3">Rule matched</span>
          <p className="mt-0.5 text-[12px] text-ink-2">Low inventory + high vendor reliability.</p>
        </div>
      </div>
      <div className="primitive-card-footer flex items-center justify-between gap-2 border-t border-line bg-inset">
        <button className="h-7 rounded-control bg-surface px-2.5 text-[12px] font-medium text-ink shadow-btn transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.96]">
          Reject
        </button>
        <button className="h-7 rounded-control bg-accent px-3 text-[12px] font-medium text-white shadow-btn transition-transform duration-150 active:scale-[0.96]">
          Accept
        </button>
      </div>
    </div>
  );
}

function RankedAlternatives() {
  const rows = [
    ["Cone King", "Best match", "92%", "green" as const],
    ["Joy Cone", "Cheaper, slower", "84%", "blue" as const],
    ["Local bakery", "Needs review", "71%", "orange" as const],
  ] as const;

  return (
    <div className="w-full max-w-86 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="primitive-card-bar border-b border-line">
        <p className="text-[13px] font-semibold text-ink">Recommended supplier</p>
        <p className="text-[12px] text-ink-3">Ranked by stockout prevention and margin impact.</p>
      </div>
      <div className="p-2">
        {rows.map(([name, note, score, tone], i) => (
          <div key={name} className={`flex items-center gap-2 rounded-control px-2 py-2 ${i === 0 ? "bg-inset" : ""}`}>
            <span className="flex size-5 items-center justify-center rounded-full bg-field font-mono text-[10px] text-ink-3">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium text-ink">{name}</span>
              <span className="block truncate text-[11.5px] text-ink-3">{note}</span>
            </span>
            <Pill tone={tone}>{score}</Pill>
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleInspector() {
  return (
    <div className="w-full max-w-86 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="primitive-card-pad">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-ink">Restock vanilla base</p>
          <Bars score={2} tone="var(--orange)" />
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
          Confidence is lower because the lead-time rule is close to its cutoff.
        </p>
        <div className="mt-3 grid gap-1.5">
          {[
            ["Projected stockout", "8.7 days"],
            ["Vendor SLA", "92%"],
            ["Margin impact", "+6.4%"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-control bg-inset px-2.5 py-1.5 shadow-hairline">
              <span className="text-[12px] text-ink-3">{label}</span>
              <span className="font-mono text-[12px] text-ink tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareVendors() {
  return (
    <div className="grid w-full max-w-90 grid-cols-2 gap-2">
      {([
        ["Cone King", "Recommended", "92%", "green" as const],
        ["Joy Cone", "Alternative", "84%", "blue" as const],
      ] as const).map(([name, label, score, tone]) => (
        <div key={name} className="rounded-card bg-surface p-3 shadow-card">
          <Pill tone={tone}>{label}</Pill>
          <p className="mt-3 text-[13px] font-semibold text-ink">{name}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-2">Reliable lead time, compatible pack sizes.</p>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
            <span className="text-[11.5px] text-ink-3">Score</span>
            <span className="font-mono text-[13px] text-ink tabular-nums">{score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionLog() {
  const steps = ["Read POS export", "Matched reorder rule", "Checked supplier SLA", "Recommended Cone King"];

  return (
    <div className="primitive-card-pad w-full max-w-86 rounded-card bg-surface shadow-card">
      <p className="text-[13px] font-semibold text-ink">Why this recommendation?</p>
      <div className="mt-3 border-l border-line pl-3">
        {steps.map((step, i) => (
          <div key={step} className="relative pb-3 last:pb-0">
            <span className="absolute -left-[17px] top-0.5 size-2 rounded-full bg-accent shadow-[0_0_0_3px_var(--surface)]" />
            <p className="text-[12.5px] font-medium text-ink">{step}</p>
            <p className="text-[11.5px] text-ink-3">Step {i + 1} completed by agent.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatIfScorer() {
  return (
    <div className="primitive-card-pad w-full max-w-86 rounded-card bg-surface shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">What if demand spikes?</p>
        <Pill tone="green">88%</Pill>
      </div>
      <div className="mt-4 space-y-3">
        {[
          ["Demand lift", "18%"],
          ["Rush freight", "Off"],
          ["Vendor risk", "Low"],
        ].map(([label, value], i) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-ink-2">{label}</span>
              <span className="font-mono text-ink-3">{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-field">
              <div className="h-full rounded-full bg-accent" style={{ width: `${[62, 36, 78][i]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MinimalInlineDiff() {
  return (
    <div className="w-full max-w-96 overflow-hidden rounded-card bg-surface shadow-card">
      <TableHeader cols={["Flavor", "Status", "Supplier"]} />
      <TableRow tone="red" cells={["Rocky Road", "Retire", "bear-creek"]} />
      <TableRow cells={["Mint Chip", "Keep", "verde-farms"]} />
      <TableRow tone="green" cells={["Pistachio", "Add", "verde-farms"]} />
    </div>
  );
}

function AttioStyleTable() {
  return (
    <div className="w-full max-w-96 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="text-[12.5px] font-medium text-ink">Menu records</span>
        <Pill tone="blue">3 suggestions</Pill>
      </div>
      <TableHeader cols={["Name", "Object", "AI status"]} />
      <TableRow cells={["Rocky Road", "Flavor", "Deactivate"]} tone="red" />
      <TableRow cells={["Pistachio", "Flavor", "Create"]} tone="green" />
      <TableRow cells={["Waffle cones", "Supply", "Review"]} tone="orange" />
    </div>
  );
}

function BeforeAfterSplit() {
  return (
    <div className="grid w-full max-w-96 grid-cols-2 gap-2">
      <MiniPanel title="Before" rows={["Rocky Road active", "Bubblegum active", "No pistachio row"]} />
      <MiniPanel title="After" rows={["Rocky Road retired", "Bubblegum retired", "Pistachio added"]} accent />
    </div>
  );
}

function ReviewQueue() {
  return (
    <div className="w-full max-w-96 rounded-card bg-surface p-2 shadow-card">
      {[
        ["Deactivate", "Rocky Road", "Low velocity"],
        ["Deactivate", "Bubblegum", "No recent orders"],
        ["Create", "Pistachio", "Seasonal demand"],
      ].map(([action, item, reason], i) => (
        <div key={item} className="flex items-center gap-2 rounded-control px-2 py-2 hover:bg-hover">
          <span className="flex size-5 items-center justify-center rounded-full bg-field font-mono text-[10px] text-ink-3">{i + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-medium text-ink">{action} {item}</span>
            <span className="block text-[11.5px] text-ink-3">{reason}</span>
          </span>
          <button className="h-6 rounded-control bg-surface px-2 text-[11.5px] font-medium text-ink shadow-btn active:scale-[0.96]">
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}

function CellLevelDiff() {
  return (
    <div className="w-full max-w-96 overflow-hidden rounded-card bg-surface shadow-card">
      <TableHeader cols={["Flavor", "Category", "Supplier"]} />
      <TableRow cells={["Rocky Road", "Classic → Retired", "bear-creek"]} tone="red" />
      <TableRow cells={["Bubblegum", "Retro → Retired", "sweet-labs"]} tone="red" />
      <TableRow cells={["Pistachio", "— → Seasonal", "verde-farms"]} tone="green" />
    </div>
  );
}

function CollapsedSummary() {
  return (
    <div className="w-full max-w-96 overflow-hidden rounded-card bg-surface shadow-card">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">AI</span>
        <span className="min-w-0 flex-1 text-[12.5px] font-medium text-ink">Clean up stale flavors</span>
        <Pill tone="blue">4 edits</Pill>
      </div>
      <div className="p-3">
        <p className="text-[12.5px] leading-relaxed text-ink-2">
          Retire 2 underperforming records, create 1 seasonal record, update 1 supplier mapping.
        </p>
        <div className="mt-3 rounded-control bg-inset p-1 shadow-hairline">
          {["− Rocky Road", "− Bubblegum", "+ Pistachio"].map((row) => (
            <div key={row} className="rounded-[6px] px-2 py-1 font-mono text-[11.5px] text-ink-2">{row}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div className="grid grid-cols-3 border-b border-line bg-inset px-3 py-2 text-[11.5px] font-medium text-ink-3">
      {cols.map((col) => <span key={col}>{col}</span>)}
    </div>
  );
}

function TableRow({ cells, tone }: { cells: string[]; tone?: "red" | "green" | "orange" }) {
  const bg = tone === "red" ? "bg-red-tint" : tone === "green" ? "bg-green-tint" : tone === "orange" ? "bg-orange-tint" : "";
  const fg = tone === "red" ? "text-red" : tone === "green" ? "text-green" : tone === "orange" ? "text-orange" : "text-ink-2";

  return (
    <div className={`grid grid-cols-3 border-b border-line px-3 py-2 text-[12px] last:border-0 ${bg}`}>
      {cells.map((cell, i) => (
        <span key={`${cell}-${i}`} className={`min-w-0 truncate ${i === 0 ? "font-medium text-ink" : fg}`}>
          {cell}
        </span>
      ))}
    </div>
  );
}

function MiniPanel({ title, rows, accent }: { title: string; rows: string[]; accent?: boolean }) {
  return (
    <div className="rounded-card bg-surface p-2.5 shadow-card">
      <p className={`text-[12.5px] font-semibold ${accent ? "text-green" : "text-ink"}`}>{title}</p>
      <div className="mt-2 space-y-1">
        {rows.map((row) => (
          <div key={row} className="rounded-control bg-inset px-2 py-1.5 text-[11.5px] text-ink-2 shadow-hairline">
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DirectionsPage() {
  return (
    <main className="mx-auto max-w-[1040px] bg-page px-6 py-8 shadow-[0_0_0_1px_var(--line)] sm:px-8 lg:px-10">
      <header className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Link href="/" className="inline-flex text-[12.5px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink">
            ← Back to components
          </Link>
          <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.035em] text-ink text-balance">
            Recommendation and diff table directions
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2 text-pretty">
            These are disposable visual directions. Pick the strongest concept, then I’ll rebuild the actual primitive with that direction.
          </p>
        </div>
        <div className="rounded-card bg-surface p-3 shadow-card">
          <p className="text-[11.5px] font-medium text-ink-3">Selection format</p>
          <p className="mt-1 font-mono text-[13px] text-ink">R2 + D5</p>
        </div>
      </header>

      <Section
        eyebrow="Recommendation Card"
        title="Six ways to present an agent recommendation"
        description="The main tradeoff is whether this primitive should optimize for decisive action, explainability, or comparing alternatives."
        options={recOptions}
      />

      <Section
        eyebrow="Diff Table"
        title="Six ways to show AI-proposed table changes"
        description="The main tradeoff is whether this should feel like a table edit, a review queue, or a compact audit summary."
        options={diffOptions}
      />
    </main>
  );
}
