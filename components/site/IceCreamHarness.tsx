"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ApprovalCard from "@/components/primitives/ApprovalCard";
import CodeBlock from "@/components/primitives/CodeBlock";
import ContextCards from "@/components/primitives/ContextCards";
import DiffTable from "@/components/primitives/DiffTable";
import FilterTable from "@/components/primitives/FilterTable";
import FineTuneCard from "@/components/primitives/FineTuneCard";
import InsightCards from "@/components/primitives/InsightCards";
import LoadingState from "@/components/primitives/LoadingState";
import PromptBar from "@/components/primitives/PromptBar";
import RecommendationCard from "@/components/primitives/RecommendationCard";
import RecordsTable from "@/components/primitives/RecordsTable";
import SearchList from "@/components/primitives/SearchList";
import SelectionActions from "@/components/primitives/SelectionActions";
import StreamingText from "@/components/primitives/StreamingText";
import TaskRows from "@/components/primitives/TaskRows";
import ThinkingState from "@/components/primitives/ThinkingState";
import ToolChips from "@/components/primitives/ToolChips";

/* ─────────────────────────────────────────────────────────
 * ICE CREAM HARNESS
 * An interactive chat window that shows every Beautiful UI
 * primitive in its natural habitat. Ask a question (or tap a
 * suggestion) and the agent replies — thinking, then building
 * the answer out of live components. Everything is fake data.
 * ───────────────────────────────────────────────────────── */

const NAME = "Shane";

/* ── shared bits ──────────────────────────────────────────── */

function SectionHeading({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <span className="font-mono text-[10.5px] tabular-nums text-ink-3">{number}</span>
      <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      <span className="truncate text-[12px] text-ink-3">{detail}</span>
    </div>
  );
}

function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-[620px] text-[13.5px] leading-[1.65] text-ink-2">{children}</p>;
}

/* the charts land only after the streamed text has finished */
function WorkloadAnswer() {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCards(true), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="max-w-[630px]">
        <StreamingText />
      </div>
      {showCards && (
        <div className="mt-5" style={{ animation: "fade-up 450ms cubic-bezier(0.23,1,0.32,1) both" }}>
          <InsightCards />
        </div>
      )}
    </>
  );
}

/* ── scenarios ────────────────────────────────────────────────
 * Each maps a user prompt to an agent reply built from primitives.
 * `beat` is how long the agent "thinks" before the answer resolves
 * — shorter when the answer leads with its own live trace.
 */

type Scenario = {
  prompt: string;
  beat: number;
  Answer: () => ReactNode;
};

const SCENARIOS: Record<string, Scenario> = {
  todos: {
    prompt: "What urgent to-dos need my attention this morning?",
    beat: 1100,
    Answer: () => (
      <>
        <Prose>
          Three things are time-sensitive. I ordered them by how soon they&apos;ll bite and drafted the supplier
          notes, so you can clear them without leaving the thread.
        </Prose>
        <div className="mt-5">
          <SectionHeading number="01" title="Tasks" detail="agent checklist" />
          <TaskRows variant="List" />
        </div>
        <div className="mt-6">
          <SectionHeading number="02" title="Recommended next" detail="one call to make" />
          <RecommendationCard />
        </div>
      </>
    ),
  },
  workload: {
    prompt: "Prep a summary of my workload.",
    beat: 900,
    Answer: () => <WorkloadAnswer />,
  },
  offboarding: {
    prompt: "I need your approval before I off-board a supplier.",
    beat: 850,
    Answer: () => (
      <>
        <Prose>
          Before I archive the vendor, confirm a few details. Single questions advance on their own; multi-selects
          wait for the arrow.
        </Prose>
        <div className="mt-5">
          <ApprovalCard />
        </div>
      </>
    ),
  },
  "find-ticket": {
    prompt: "There was a ticket about redesigning the flavor page — can you find it?",
    beat: 500,
    Answer: () => (
      <>
        <ThinkingState variant="Search" />
        <Prose>Found it, plus the two docs it references. Here&apos;s the match and the context I pulled.</Prose>
        <div className="mt-5">
          <SectionHeading number="01" title="Matches" detail="workspace search" />
          <SearchList />
        </div>
        <div className="mt-6">
          <SectionHeading number="02" title="Context" detail="2 sources" />
          <ContextCards />
        </div>
      </>
    ),
  },
  suppliers: {
    prompt: "Show me our supplier records.",
    beat: 1000,
    Answer: () => (
      <>
        <Prose>
          Here&apos;s the working set. The filters and full grid are connected, so you can narrow the launch list
          without leaving the thread.
        </Prose>
        <div className="mt-5 flex flex-col gap-7">
          <div>
            <SectionHeading number="01" title="Launch filter" detail="status chips" />
            <div className="overflow-x-auto pb-1">
              <FilterTable />
            </div>
          </div>
          <div>
            <SectionHeading number="02" title="Supplier records" detail="26 makers" />
            <div className="overflow-x-auto pb-1">
              <RecordsTable />
            </div>
          </div>
        </div>
      </>
    ),
  },
  restock: {
    prompt: "Draft the batch restock function.",
    beat: 500,
    Answer: () => (
      <>
        <Prose>I planned it out and wrote the function I&apos;ll use to stage the run. Nothing runs until you say so.</Prose>
        <div className="mt-5">
          <SectionHeading number="01" title="Run" detail="4 tool calls" />
          <ToolChips />
        </div>
        <div className="mt-6">
          <SectionHeading number="02" title="Batch function" detail="review before apply" />
          <CodeBlock />
        </div>
      </>
    ),
  },
  edits: {
    prompt: "Propose edits to the flavor list.",
    beat: 1000,
    Answer: () => (
      <>
        <Prose>I staged the changes as a reviewable draft — nothing is applied yet. Sweep through and approve what looks right.</Prose>
        <div className="mt-5">
          <SectionHeading number="01" title="Proposed edits" detail="review before apply" />
          <DiffTable />
        </div>
      </>
    ),
  },
  rewrite: {
    prompt: "Help me tighten this launch note.",
    beat: 700,
    Answer: () => (
      <>
        <Prose>Select any passage and hand it to me. I highlighted a line below — pick an action or describe the edit.</Prose>
        <div className="mt-5">
          <SelectionActions />
        </div>
      </>
    ),
  },
  tune: {
    prompt: "Adjust the recommendation card styling.",
    beat: 850,
    Answer: () => (
      <>
        <Prose>I&apos;ll nudge the design tokens live. Drag a label to scrub the value, use ↑ ↓, or just type.</Prose>
        <div className="mt-5">
          <FineTuneCard />
        </div>
      </>
    ),
  },
};

type ScenarioId = keyof typeof SCENARIOS;

const KEYWORDS: [ScenarioId, string[]][] = [
  ["todos", ["todo", "to-do", "urgent", "morning", "attention", "task"]],
  ["workload", ["summary", "summarize", "workload", "overview", "recap", "digest"]],
  ["offboarding", ["approve", "approval", "off-board", "offboard", "confirm", "sign off"]],
  ["find-ticket", ["find", "search", "ticket", "where", "look up", "locate"]],
  ["suppliers", ["supplier", "records", "vendor", "table", "maker", "grid"]],
  ["restock", ["restock", "code", "function", "batch", "script", "reorder"]],
  ["edits", ["edit", "diff", "change", "propose", "update the", "flavor list"]],
  ["rewrite", ["rewrite", "tighten", "reword", "shorten", "note", "copy"]],
  ["tune", ["tune", "adjust", "styling", "design", "token", "inspector", "tweak"]],
];

function matchScenario(text: string): ScenarioId {
  const lower = text.toLowerCase();
  for (const [id, words] of KEYWORDS) {
    if (words.some((word) => lower.includes(word))) return id;
  }
  return "workload";
}

/* ── suggestion + recents catalogs ────────────────────────── */

function SuggestionIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    todos: <g><path d="M11 6h9M11 12h9M11 18h9" /><path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17" /></g>,
    workload: <g><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 10l2.5 2.5L16 8" /></g>,
    "find-ticket": <g><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></g>,
    suppliers: <g><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></g>,
    restock: <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />,
    rewrite: <g><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></g>,
    tune: <g><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></g>,
  };
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[kind] ?? paths.workload}
    </svg>
  );
}

const SUGGESTION_POOL: { id: ScenarioId; label: string }[] = [
  { id: "todos", label: "What urgent to-dos need my attention this morning?" },
  { id: "workload", label: "Prep a summary of my workload" },
  { id: "find-ticket", label: "Find the ticket about the flavor page redesign" },
  { id: "suppliers", label: "Show me our supplier records" },
  { id: "restock", label: "Draft the batch restock function" },
  { id: "rewrite", label: "Tighten this launch note" },
  { id: "tune", label: "Adjust the recommendation card styling" },
];

const RECENTS: { id: ScenarioId; label: string }[] = [
  { id: "todos", label: "Urgent to-dos this morning" },
  { id: "find-ticket", label: "Flavor page ticket" },
  { id: "suppliers", label: "Supplier records" },
  { id: "workload", label: "Workload summary" },
  { id: "offboarding", label: "Off-board a supplier" },
  { id: "restock", label: "Batch restock function" },
  { id: "edits", label: "Propose flavor edits" },
  { id: "tune", label: "Tune the card styling" },
];

/* ── the agent reply — thinks, then builds the answer ─────── */

function AssistantResponse({ scenarioId, className = "" }: { scenarioId: ScenarioId; className?: string }) {
  const scenario = SCENARIOS[scenarioId];
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnswered(true), scenario.beat);
    return () => clearTimeout(t);
  }, [scenario.beat]);

  return (
    <article className={`min-w-0 ${className}`} style={{ animation: "fade-up 450ms cubic-bezier(0.23,1,0.32,1) both" }}>
      {answered ? (
        scenario.Answer()
      ) : (
        <div className="flex min-h-6 items-center" style={{ animation: "fade-in 200ms ease-out both" }}>
          <LoadingState label="Thinking" variant="Dots" />
        </div>
      )}
    </article>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end pl-10 sm:pl-24" style={{ animation: "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both" }}>
      <div className="rounded-xl bg-field px-3.5 py-2 text-[13px] leading-relaxed text-ink shadow-hairline">{text}</div>
    </div>
  );
}

/* ── empty state ──────────────────────────────────────────── */

function EmptyState({ onSend, shuffle, offset }: { onSend: (text: string, id: ScenarioId) => void; shuffle: () => void; offset: number }) {
  const shown = [0, 1, 2].map((i) => SUGGESTION_POOL[(offset + i) % SUGGESTION_POOL.length]);

  return (
    <div className="mx-auto flex min-h-full max-w-[720px] flex-col justify-center px-4 py-10 sm:px-8">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink" style={{ animation: "fade-up 500ms cubic-bezier(0.23,1,0.32,1) both" }}>
        <span className="block text-ink-3">Hi {NAME},</span>
        How can I help you today?
      </h1>

      <div className="mt-7" style={{ animation: "fade-up 500ms cubic-bezier(0.23,1,0.32,1) 120ms both" }}>
        <PromptBar
          demo={false}
          placeholder="Ask anything about your creamery ops…"
          onSend={(text) => onSend(text, matchScenario(text))}
        />
      </div>

      <div className="mt-6 flex flex-col" style={{ animation: "fade-up 500ms cubic-bezier(0.23,1,0.32,1) 180ms both" }}>
        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSend(item.label, item.id)}
            className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2.5 text-left text-[14px] text-ink transition-colors duration-150 hover:bg-hover"
          >
            <span className="text-ink-3">
              {item.id === "offboarding" ? (
                <span className="block size-3.5 rounded-full bg-gradient-to-br from-orange to-red" />
              ) : (
                <SuggestionIcon kind={item.id} />
              )}
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
          </button>
        ))}
        <div className="mt-1 flex items-center gap-5 pl-0.5 text-[13px] text-ink-3">
          <button type="button" className="flex items-center gap-2 py-1 transition-colors duration-150 hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>
            Connect your apps for a better experience
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <button type="button" onClick={shuffle} className="flex items-center gap-2 py-1 transition-colors duration-150 hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>
            Shuffle suggestions
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── sidebar ──────────────────────────────────────────────── */

/* rows share the SidebarNav language: one gliding hover highlight
 * per group, 13px labels, icons that darken with state */
function GlideGroup({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);

  return (
    <div
      ref={ref}
      onMouseOver={(event) => {
        const row = (event.target as Element).closest("[data-row]");
        const container = ref.current;
        if (!row || !container) return;
        const containerRect = container.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        setBox({ top: rowRect.top - containerRect.top, height: rowRect.height });
      }}
      onMouseLeave={() => setBox(null)}
      className="relative flex flex-col gap-px"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 rounded-[7px] bg-hover"
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: box ? 1 : 0,
          transition:
            "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
        }}
      />
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-3">
      {children}
    </div>
  );
}

function RailButton({
  icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      data-row
      type="button"
      onClick={onClick}
      className={`relative z-10 flex w-full items-center gap-2 rounded-[7px] px-2 py-1.5 text-left
        transition-[color,transform] duration-150 active:scale-[0.98] ${active ? "bg-hover" : ""}`}
    >
      <span className={active ? "text-ink" : "text-ink-3"}>{icon}</span>
      <span className={`min-w-0 flex-1 truncate text-[13px] ${active ? "font-medium text-ink" : "text-ink-2"}`}>
        {label}
      </span>
      {badge && (
        <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-tint px-1 text-[10.5px] font-semibold tabular-nums text-accent-ink">
          {badge}
        </span>
      )}
    </button>
  );
}

function Sidebar({ onPick, onNewChat }: { onPick: (id: ScenarioId, label: string) => void; onNewChat: () => void }) {
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-line bg-canvas/35 p-2.5 lg:flex">
      {/* workspace switcher */}
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-control p-1.5 text-left transition-[background-color,transform] duration-100 hover:bg-hover active:scale-[0.98]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-ink text-[13px] font-semibold text-surface">C</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight text-ink">Creamery Ops</span>
            <span className="block truncate text-[11px] leading-tight text-ink-3">Support workspace</span>
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 15l5 5 5-5M7 9l5-5 5 5" /></svg>
        </button>
        <button type="button" aria-label="Collapse sidebar" className="flex size-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>
        </button>
      </div>

      {/* primary nav */}
      <GlideGroup>
        <RailButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" /></svg>} label="Home" />
        <RailButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" /></svg>} label="Chats" active />
        <RailButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>} label="Search" />
      </GlideGroup>

      {/* accent action — aligned with the rows above it */}
      <button
        type="button"
        onClick={onNewChat}
        className="mt-px flex w-full items-center gap-2 rounded-[7px] px-2 py-1.5 text-[13px] font-medium text-accent
          transition-[background-color,transform] duration-100 hover:bg-accent-tint active:scale-[0.98]"
      >
        <span className="min-w-0 flex-1 truncate text-left">New chat</span>
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>

      {/* recents */}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
        <SectionLabel>Recents</SectionLabel>
        <GlideGroup>
          {RECENTS.map((item) => (
            <button
              key={item.label}
              data-row
              type="button"
              onClick={() => onPick(item.id, item.label)}
              className="relative z-10 flex w-full items-center rounded-[7px] px-2 py-1.5 text-left transition-[color,transform] duration-150 active:scale-[0.98]"
            >
              <span className="min-w-0 truncate text-[13px] text-ink-2">{item.label}</span>
            </button>
          ))}
        </GlideGroup>
      </div>

      {/* promo card — pinned low, just above the footer */}
      <div className="mt-3 overflow-hidden rounded-card bg-surface shadow-card">
        <div className="flex items-center justify-between px-3 pt-3">
          <span className="rounded-full bg-green-tint px-2 py-0.5 text-[10.5px] font-medium text-green">New</span>
          <button type="button" aria-label="Dismiss" className="flex size-5 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="px-3 pt-2 text-[12.5px] font-medium leading-snug text-ink">Seasonal flavor planner &amp; supplier transfers</p>
        <div className="m-3 mt-2.5 flex flex-col gap-1.5 rounded-control bg-inset p-2 shadow-hairline">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`size-3.5 shrink-0 rounded-full ${i === 1 ? "bg-accent/70" : "bg-line-strong"}`} />
              <span className="h-1.5 rounded-full bg-line-strong" style={{ width: `${[64, 44, 72][i]}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="mt-2.5 border-t border-line pt-2">
        <GlideGroup>
          <RailButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>} label="Add members" />
          <RailButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>} label="Help" badge="12" />
        </GlideGroup>
        <div className="mt-1.5 flex items-center justify-between border-t border-line px-2 pt-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-semibold text-accent-ink">{NAME.charAt(0)}</span>
            <span className="truncate text-[13px] font-medium text-ink">{NAME} Levine</span>
          </span>
          <button type="button" aria-label="Notifications" className="relative flex size-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── main ─────────────────────────────────────────────────── */

type Msg = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; scenarioId: ScenarioId };
type Chat = { id: number; title: string | null; messages: Msg[] };

export default function IceCreamHarness() {
  const [chats, setChats] = useState<Chat[]>([{ id: 1, title: null, messages: [] }]);
  const [activeId, setActiveId] = useState(1);
  const [offset, setOffset] = useState(0);
  const chatIdRef = useRef(1);
  const msgIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === activeId) ?? chats[0];
  const active = chat.messages.length > 0;

  const appendExchange = (target: Chat, text: string, scenarioId: ScenarioId): Chat => ({
    ...target,
    title: target.title ?? (text.length > 30 ? `${text.slice(0, 30).trimEnd()}…` : text),
    messages: [
      ...target.messages,
      { id: (msgIdRef.current += 1), role: "user", text },
      { id: (msgIdRef.current += 1), role: "assistant", scenarioId },
    ],
  });

  const send = (text: string, scenarioId: ScenarioId) => {
    setChats((current) => current.map((c) => (c.id === chat.id ? appendExchange(c, text, scenarioId) : c)));
  };

  /* recents open in a fresh chat unless the current one is empty */
  const pickRecent = (scenarioId: ScenarioId, label: string) => {
    if (chat.messages.length === 0) {
      send(label, scenarioId);
      return;
    }
    const id = (chatIdRef.current += 1);
    setChats((current) => [...current, appendExchange({ id, title: null, messages: [] }, label, scenarioId)]);
    setActiveId(id);
  };

  /* reuse an existing empty chat instead of stacking blank tabs */
  const newChat = () => {
    const empty = chats.find((c) => c.messages.length === 0);
    if (empty) {
      setActiveId(empty.id);
      return;
    }
    const id = (chatIdRef.current += 1);
    setChats((current) => [...current, { id, title: null, messages: [] }]);
    setActiveId(id);
  };

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat.messages, active]);

  return (
    <main className="h-[100dvh] bg-page text-ink">
      <div className="flex h-full overflow-hidden bg-page">
        <Sidebar onPick={pickRecent} onNewChat={newChat} />

        <section className="flex min-w-0 flex-1 flex-col bg-page">
          {/* chat tabs — same header language as the Chat primitive */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-1.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
              {chats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={c.id === activeId}
                  onClick={() => setActiveId(c.id)}
                  className={`max-w-44 shrink-0 truncate rounded-[6px] px-2 py-[3px] text-[13px] text-ink transition-[background-color,opacity] duration-100 ${
                    c.id === activeId ? "bg-field" : "opacity-50 hover:opacity-75"
                  }`}
                >
                  {c.title ?? "New chat"}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="New chat"
              onClick={newChat}
              className="flex size-6 shrink-0 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>

          {active ? (
            <>
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12">
                  {chat.messages.map((message) =>
                    message.role === "user" ? (
                      <UserBubble key={message.id} text={message.text} />
                    ) : (
                      <AssistantResponse key={message.id} scenarioId={message.scenarioId} />
                    ),
                  )}
                </div>
              </div>
              <div className="shrink-0 border-t border-line bg-page px-4 py-3 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-[820px]">
                  <PromptBar
                    demo={false}
                    placeholder="Reply, or ask for another component…"
                    onSend={(text) => send(text, matchScenario(text))}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <EmptyState onSend={send} shuffle={() => setOffset((current) => (current + 3) % SUGGESTION_POOL.length)} offset={offset} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
