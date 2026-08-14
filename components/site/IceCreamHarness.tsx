"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ApprovalCard from "@/components/primitives/ApprovalCard";
import CodeBlock from "@/components/primitives/CodeBlock";
import ContextCards from "@/components/primitives/ContextCards";
import DiffTable from "@/components/primitives/DiffTable";
import InsightCards from "@/components/primitives/InsightCards";
import LoadingState from "@/components/primitives/LoadingState";
import PromptBar from "@/components/primitives/PromptBar";
import RecommendationCard from "@/components/primitives/RecommendationCard";
import RecordsTable from "@/components/primitives/RecordsTable";
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

function Prose({ children }: { children: ReactNode }) {
  return <p className="max-w-[620px] text-[13.5px] leading-[1.65] text-ink-2">{children}</p>;
}

/* the charts land only after the streamed text has finished */
function WorkloadAnswer() {
  const [showCards, setShowCards] = useState(false);

  return (
    <>
      <div className="max-w-[630px]">
        <StreamingText fill loop={false} onDone={() => setShowCards(true)} />
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
  /** optional artifact for the right-hand pane */
  paneTitle?: string;
  Pane?: () => ReactNode;
};

const SCENARIOS: Record<string, Scenario> = {
  todos: {
    prompt: "What urgent to-dos need my attention this morning?",
    beat: 1100,
    paneTitle: "Tasks",
    Pane: () => (
      <>
        <TaskRows variant="List" />
        <div className="mt-6">
          <ContextCards />
        </div>
      </>
    ),
    Answer: () => (
      <>
        <Prose>
          Three things are time-sensitive. I put the checklist in the side panel, ordered by how soon
          they&apos;ll bite — and there&apos;s one call worth making first.
        </Prose>
        <div className="mt-5">
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
    paneTitle: "Context",
    Pane: () => <ContextCards />,
    Answer: () => (
      <>
        <ThinkingState variant="Search" />
        <Prose>
          Found it — the flavor page redesign ticket, plus the two docs it references. The retrieved
          chunks are in the side panel.
        </Prose>
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
        <div className="mt-5 overflow-x-auto pb-1">
          <RecordsTable />
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
          <ToolChips />
        </div>
        <div className="mt-6">
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
];

const RECENTS: { id: ScenarioId; label: string }[] = [
  { id: "todos", label: "Urgent to-dos this morning" },
  { id: "find-ticket", label: "Flavor page ticket" },
  { id: "suppliers", label: "Supplier records" },
  { id: "workload", label: "Workload summary" },
  { id: "offboarding", label: "Off-board a supplier" },
  { id: "restock", label: "Batch restock function" },
  { id: "edits", label: "Propose flavor edits" },
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

      <div className="relative mt-7" style={{ animation: "fade-up 500ms cubic-bezier(0.23,1,0.32,1) 120ms both" }}>
        {/* a slow spectrum glow peeking out below the composer */}
        <div aria-hidden className="rainbow-peek absolute inset-x-8 -bottom-2 h-10 opacity-45" />
        <div className="relative">
          <PromptBar
            demo={false}
            tall
            placeholder="Ask anything about your creamery ops…"
            onSend={(text) => onSend(text, matchScenario(text))}
          />
        </div>
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
  const [hovering, setHovering] = useState(false);

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
        setHovering(true);
      }}
      onMouseLeave={() => setHovering(false)}
      className="group/glide relative flex flex-col gap-px"
    >
      {/* hover-2 (plain hover is invisible on canvas); on leave it fades
        * out in place rather than gliding back */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 rounded-[7px] bg-hover-2"
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: box && hovering ? 1 : 0,
          transition:
            "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
        }}
      />
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 pb-1 pt-1 text-[11.5px] font-medium text-ink-3">{children}</div>;
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
        transition-[background-color,color,transform] duration-150 active:scale-[0.98]
        ${active ? "bg-hover-2 group-hover/glide:bg-transparent" : ""}`}
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

const WORKSPACES = [
  { key: "creamery", name: "Creamery Ops", sub: "Support workspace", monogram: "C" },
  { key: "gelato", name: "Gelato Lab", sub: "R&D workspace", monogram: "G" },
  { key: "cone", name: "Cone King HQ", sub: "Wholesale workspace", monogram: "K" },
];

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <path d="M3 11l9-8 9 8M5 9.5V21h14V9.5" /> },
  { key: "chats", label: "Chats", icon: <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" /> },
  { key: "search", label: "Search", icon: <g><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></g> },
];

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

function Sidebar({ onPick, onNewChat }: { onPick: (id: ScenarioId, label: string) => void; onNewChat: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [nav, setNav] = useState("chats");
  const [workspace, setWorkspace] = useState(WORKSPACES[0]);
  const [wsOpen, setWsOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [promoOpen, setPromoOpen] = useState(true);

  /* click anywhere else closes the workspace menu */
  useEffect(() => {
    if (!wsOpen) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest("[data-ws]")) setWsOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [wsOpen]);

  return (
    <aside
      className="hidden shrink-0 overflow-hidden border-r border-line bg-canvas/35 transition-[width] duration-300 lg:flex"
      style={{ width: collapsed ? 52 : 264, transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
    >
      {collapsed ? (
        <div className="flex w-[52px] shrink-0 flex-col items-center p-2" style={{ animation: "fade-in 250ms ease-out both" }}>
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
            className="flex size-8 items-center justify-center rounded-[7px] text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>
          </button>
          <button
            type="button"
            aria-label="New chat"
            onClick={onNewChat}
            className="mt-2 flex size-8 items-center justify-center rounded-[7px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover-2 hover:text-ink active:scale-[0.94]"
          >
            <NavIcon><g><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" /></g></NavIcon>
          </button>
          <div className="mt-1 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                onClick={() => setNav(item.key)}
                className={`flex size-8 items-center justify-center rounded-[7px] transition-colors duration-150 ${
                  nav === item.key ? "bg-hover-2 text-ink" : "text-ink-3 hover:bg-hover-2 hover:text-ink"
                }`}
              >
                <NavIcon>{item.icon}</NavIcon>
              </button>
            ))}
          </div>
          <span className="mt-auto flex size-7 items-center justify-center rounded-full bg-accent-tint text-[11px] font-semibold text-accent-ink">
            {NAME.charAt(0)}
          </span>
        </div>
      ) : (
        <div className="flex min-h-0 w-[264px] shrink-0 flex-col p-2.5" style={{ animation: "fade-in 250ms ease-out both" }}>
      {/* workspace switcher */}
      <div className="mb-2 flex items-center gap-1">
        <span data-ws className="relative min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={wsOpen}
            onClick={() => setWsOpen((current) => !current)}
            className="flex w-full min-w-0 items-center gap-2.5 rounded-control p-1.5 text-left transition-[background-color,transform] duration-100 hover:bg-hover-2 active:scale-[0.98]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-ink text-[13px] font-semibold text-surface">{workspace.monogram}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="block truncate text-[13px] font-medium leading-none text-ink">{workspace.name}</span>
              <span className="block truncate text-[11px] leading-none text-ink-3">{workspace.sub}</span>
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 15l5 5 5-5M7 9l5-5 5 5" /></svg>
          </button>
          {wsOpen && (
            <div
              className="absolute left-0 top-full z-20 mt-1 w-56 rounded-[10px] bg-surface p-1 shadow-raised"
              style={{ animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both", transformOrigin: "top left" }}
            >
              {WORKSPACES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setWorkspace(item);
                    setWsOpen(false);
                  }}
                  className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-[6px] px-2 text-left transition-colors duration-100 hover:bg-hover"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-ink text-[11px] font-semibold text-surface">{item.monogram}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">{item.name}</span>
                  <span className={`shrink-0 text-ink ${item.key === workspace.key ? "" : "invisible"}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                </button>
              ))}
            </div>
          )}
        </span>
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={() => setCollapsed(true)}
          className="flex size-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>
        </button>
      </div>

      {/* primary nav — New chat leads, like every chat product */}
      <GlideGroup>
        <RailButton
          icon={<NavIcon><g><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z" /></g></NavIcon>}
          label="New chat"
          onClick={onNewChat}
        />
        {NAV_ITEMS.map((item) => (
          <RailButton
            key={item.key}
            icon={<NavIcon>{item.icon}</NavIcon>}
            label={item.label}
            active={nav === item.key}
            onClick={() => setNav(item.key)}
          />
        ))}
      </GlideGroup>

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
      {promoOpen && (
        <div className="mt-3 overflow-hidden rounded-card bg-surface shadow-card">
          <div className="flex items-center justify-between px-3 pt-3">
            <span className="rounded-full bg-green-tint px-2 py-0.5 text-[10.5px] font-medium text-green">New</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setPromoOpen(false)}
              className="flex size-5 items-center justify-center rounded-[5px] text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="px-3 pt-2 text-[12.5px] font-medium leading-snug text-ink">Seasonal flavor planner &amp; supplier transfers</p>
          <div className="mx-3 mt-2.5 flex flex-col gap-1.5 rounded-control bg-inset p-2 shadow-hairline">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={`size-3.5 shrink-0 rounded-full ${i === 1 ? "bg-accent/70" : "bg-line-strong"}`} />
                <span className="h-1.5 rounded-full bg-line-strong" style={{ width: `${[64, 44, 72][i]}%` }} />
              </div>
            ))}
          </div>
          <div className="p-3 pt-2.5">
            <button
              type="button"
              onClick={() => onPick("edits", "Seasonal flavor planner")}
              className="flex h-7 w-full items-center justify-center gap-1.5 rounded-control bg-surface text-[12px] font-medium text-ink shadow-btn transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.97]"
            >
              Open planner
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      )}

          {/* footer */}
          <div className="mt-2.5 flex items-center justify-between border-t border-line px-2 pt-2.5">
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-semibold text-accent-ink">{NAME.charAt(0)}</span>
              <span className="truncate text-[13px] font-medium text-ink">{NAME} Levine</span>
            </span>
            <button
              type="button"
              aria-label={unread ? "Notifications — unread" : "Notifications"}
              onClick={() => setUnread(false)}
              className="relative flex size-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
              {unread && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── main ─────────────────────────────────────────────────── */

type Msg = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; scenarioId: ScenarioId };
type Chat = { id: number; title: string | null; messages: Msg[] };

/* the pane arrives on the same beat as the answer it belongs to */
function PaneReveal({ beat, children }: { beat: number; children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), beat);
    return () => clearTimeout(t);
  }, [beat]);

  return show ? <>{children}</> : null;
}

export default function IceCreamHarness() {
  const [chats, setChats] = useState<Chat[]>([{ id: 1, title: null, messages: [] }]);
  const [activeId, setActiveId] = useState(1);
  const [offset, setOffset] = useState(0);
  const chatIdRef = useRef(1);
  const msgIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === activeId) ?? chats[0];
  const active = chat.messages.length > 0;

  /* right-hand pane: the latest assistant message that carries one */
  const [closedPaneId, setClosedPaneId] = useState(0);
  const lastPaneMsg = [...chat.messages]
    .reverse()
    .find(
      (m): m is Extract<Msg, { role: "assistant" }> =>
        m.role === "assistant" && !!SCENARIOS[m.scenarioId].Pane,
    );
  const paneMsg = lastPaneMsg && lastPaneMsg.id !== closedPaneId ? lastPaneMsg : null;
  const paneScenario = paneMsg ? SCENARIOS[paneMsg.scenarioId] : null;

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

  /* reopening an existing chat replays it; otherwise recents open in a
   * fresh chat unless the current one is empty */
  const [replay, setReplay] = useState<Record<number, number>>({});
  const pickRecent = (scenarioId: ScenarioId, label: string) => {
    const existing = chats.find((c) => c.title === label);
    if (existing) {
      setActiveId(existing.id);
      setReplay((current) => ({ ...current, [existing.id]: (current[existing.id] ?? 0) + 1 }));
      return;
    }
    if (chat.messages.length === 0) {
      send(label, scenarioId);
      return;
    }
    const id = (chatIdRef.current += 1);
    setChats((current) => [...current, appendExchange({ id, title: null, messages: [] }, label, scenarioId)]);
    setActiveId(id);
  };

  const newChat = () => {
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
            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12">
                    {chat.messages.map((message) =>
                      message.role === "user" ? (
                        <UserBubble key={message.id} text={message.text} />
                      ) : (
                        <AssistantResponse
                          key={`${message.id}-${replay[chat.id] ?? 0}`}
                          scenarioId={message.scenarioId}
                        />
                      ),
                    )}
                  </div>
                </div>
                <div className="shrink-0 border-t border-line bg-page px-4 pt-3 pb-6 sm:px-8 lg:px-12">
                  <div className="mx-auto max-w-[820px]">
                    <PromptBar
                      demo={false}
                      placeholder="Reply, or ask for another component…"
                      onSend={(text) => send(text, matchScenario(text))}
                    />
                  </div>
                </div>
              </div>

              {/* artifact pane — tasks and other side-by-side work */}
              {paneMsg && paneScenario?.Pane && (
                <PaneReveal key={`${paneMsg.id}-${replay[chat.id] ?? 0}`} beat={paneScenario.beat}>
                  <aside
                    className="hidden w-[360px] shrink-0 flex-col border-l border-line bg-page lg:flex"
                    style={{ animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both" }}
                  >
                    <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
                      <span className="text-[13px] font-semibold text-ink">{paneScenario.paneTitle}</span>
                      <button
                        type="button"
                        aria-label="Close pane"
                        onClick={() => setClosedPaneId(paneMsg.id)}
                        className="flex size-6 items-center justify-center rounded-[6px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">{paneScenario.Pane()}</div>
                  </aside>
                </PaneReveal>
              )}
            </div>
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
