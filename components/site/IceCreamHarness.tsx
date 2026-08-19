"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useDialKit, type DialConfig } from "dialkit";
import posthog from "posthog-js";
import ApprovalCard from "@/components/primitives/ApprovalCard";
import ContextCards from "@/components/primitives/ContextCards";
import DiffTable from "@/components/primitives/DiffTable";
import InsightCards from "@/components/primitives/InsightCards";
import LoadingState from "@/components/primitives/LoadingState";
import PromptBar from "@/components/primitives/PromptBar";
import RecommendationCard from "@/components/primitives/RecommendationCard";
import RecordsTable from "@/components/primitives/RecordsTable";
import SelectionActions from "@/components/primitives/SelectionActions";
import SidebarNav from "@/components/primitives/SidebarNav";
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

/* a lightweight word-by-word reveal, reusing the streaming keyframe */
function StreamLine({
  text,
  tone = "ink",
  onDone,
}: {
  text: string;
  tone?: "ink" | "ink-2";
  onDone?: () => void;
}) {
  const words = text.split(" ");
  const [n, setN] = useState(0);
  const streaming = n < words.length;
  useEffect(() => {
    if (!streaming) return;
    const t = setTimeout(() => setN((c) => c + 1), 34);
    return () => clearTimeout(t);
  }, [n, streaming]);
  useEffect(() => {
    if (!streaming) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);
  return (
    <p className={`max-w-[620px] text-[13.5px] leading-[1.65] ${tone === "ink" ? "text-ink" : "text-ink-2"}`}>
      {words.slice(0, n).map((word, i) => (
        <span
          key={i}
          className="inline [will-change:filter,opacity]"
          style={{ animation: "stream-in 380ms cubic-bezier(0.22,0.61,0.25,1) both" }}
        >
          {word}{" "}
        </span>
      ))}
      {streaming && <span className="stream-caret is-streaming" />}
    </p>
  );
}

/* a consistent reply: the intro streams in, then the artifact reveals below it
 * once the text settles — so nothing pops in before the sentence lands. */
function Reply({ intro, children }: { intro: string; children?: ReactNode }) {
  const [ready, setReady] = useState(false);
  return (
    <>
      <StreamLine text={intro} tone="ink-2" onDone={() => setReady(true)} />
      {ready && children != null && (
        <div className="mt-5" style={{ animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both" }}>
          {children}
        </div>
      )}
    </>
  );
}

/* the offboarding flow: answer the questions, the card collapses to a small
 * badge, then the agent thinks again and streams a short confirmation. */
function OffboardingAnswer() {
  const [stage, setStage] = useState<"form" | "thinking" | "done">("form");

  useEffect(() => {
    if (stage !== "thinking") return;
    const t = setTimeout(() => setStage("done"), 1100);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <>
      <Reply intro="Before I archive the vendor, confirm a few details. Single questions advance on their own; multi-selects wait for the arrow.">
        <ApprovalCard resettable={false} onSubmitted={() => setStage("thinking")} />
      </Reply>
      {stage === "thinking" && (
        <div className="mt-4 flex min-h-6 items-center" style={{ animation: "fade-in 200ms ease-out both" }}>
          <LoadingState label="Archiving vendor" variant="Dots" />
        </div>
      )}
      {stage === "done" && (
        <div className="mt-4" style={{ animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both" }}>
          <StreamLine text="Done — I archived Fjord Dairy, moved its 3 open orders to Northwind Creamery, and flagged the cold-chain certificate for renewal. Nothing else in the workflow references the vendor." />
        </div>
      )}
    </>
  );
}

/* the answer streams only after the search trace settles */
function FindTicketAnswer() {
  const [settled, setSettled] = useState(false);
  return (
    <>
      <ThinkingState variant="Search" onSettled={() => setSettled(true)} />
      {settled && (
        <div className="mt-1" style={{ animation: "fade-in 200ms ease-out both" }}>
          <StreamLine tone="ink-2" text="Found it — the flavor page redesign ticket, plus the two docs it references. The retrieved chunks are in the side panel." />
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
  /** optional one-off waiting treatment for a scenario */
  loadingVariant?: "Surfer";
  /** render the answer across the full chat window instead of the reading column */
  fullBleed?: boolean;
  /** optional artifact for the right-hand pane */
  paneTitle?: string;
  Pane?: () => ReactNode;
  /** spreadsheet workspace: the main pane is a live table, the chat docks to the right */
  Workspace?: () => ReactNode;
  workspaceTitle?: string;
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
      <Reply intro="Three things are time-sensitive. I put the checklist in the side panel, ordered by how soon they’ll bite — and there’s one call worth making first.">
        <RecommendationCard />
      </Reply>
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
    Answer: () => <OffboardingAnswer />,
  },
  "find-ticket": {
    prompt: "There was a ticket about redesigning the flavor page — can you find it?",
    beat: 500,
    paneTitle: "Context",
    Pane: () => <ContextCards />,
    Answer: () => <FindTicketAnswer />,
  },
  suppliers: {
    prompt: "Show me our supplier records.",
    beat: 700,
    workspaceTitle: "Suppliers",
    Workspace: () => <RecordsTable fill />,
    Answer: () => (
      <StreamLine tone="ink-2" text="The grid’s on the left. Ask me to filter, enrich, or add a column — I’ll update the table live and show my work here." />
    ),
  },
  restock: {
    prompt: "Draft the batch restock function.",
    beat: 500,
    Answer: () => (
      <Reply intro="I planned it out and staged the edits. Hover a file chip to preview its diff — nothing runs until you say so.">
        <ToolChips />
      </Reply>
    ),
  },
  edits: {
    prompt: "Propose edits to the flavor list.",
    beat: 1000,
    Answer: () => (
      <Reply intro="I staged the changes as a reviewable draft — nothing is applied yet. Sweep through and approve what looks right.">
        <DiffTable />
      </Reply>
    ),
  },
  rewrite: {
    prompt: "Help me tighten this launch note.",
    beat: 700,
    Answer: () => (
      <Reply intro="Select any passage and hand it to me. I highlighted a line below — pick an action or describe the edit.">
        <SelectionActions />
      </Reply>
    ),
  },
  surfer: {
    prompt: "Can you audit the launch plan—and put Subway Surfers underneath so my attention span stays on payroll?",
    beat: 18000,
    loadingVariant: "Surfer",
    Answer: () => <Reply intro="All done. Thanks for locking in with me." />,
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
  { id: "suppliers", label: "Show me our supplier records" },
  { id: "todos", label: "What urgent to-dos need my attention this morning?" },
  { id: "workload", label: "Prep a summary of my workload" },
  { id: "find-ticket", label: "Find the ticket about the flavor page redesign" },
  { id: "restock", label: "Draft the batch restock function" },
  { id: "rewrite", label: "Tighten this launch note" },
];

const RECENTS: { id: ScenarioId; label: string; prompt?: string }[] = [
  { id: "suppliers", label: "Supplier records" },
  { id: "todos", label: "Urgent to-dos this morning" },
  { id: "find-ticket", label: "Flavor page ticket" },
  { id: "workload", label: "Workload summary" },
  { id: "offboarding", label: "Off-board a supplier" },
  { id: "restock", label: "Batch restock function" },
  { id: "edits", label: "Propose flavor edits" },
  { id: "surfer", label: "Subway surfing", prompt: SCENARIOS.surfer.prompt },
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
        <div style={{ animation: "fade-in 260ms ease both" }}>{scenario.Answer()}</div>
      ) : (
        <div className="flex min-h-6 items-center" style={{ animation: "fade-in 200ms ease-out both" }}>
          {scenario.loadingVariant === "Surfer" ? (
            <LoadingState variant="Surfer" />
          ) : (
            <LoadingState label="Thinking" variant="Dots" />
          )}
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

/* ─────────────────────────────────────────────────────────
 * HOME ENTRANCE STORYBOARD
 *
 * Read top-to-bottom. Each value is ms after mount.
 *
 *  170ms   “Hello Shane” rises 23px, blur 17px → 0
 *  330ms   question follows with the same reveal
 *  400ms   prompt bar resolves into place
 *  550ms   recommendations finish the sequence
 * ───────────────────────────────────────────────────────── */

const HOME_REVEAL_TIMING = {
  hello:           170, // greeting enters first
  question:        330, // question follows closely
  prompt:          400, // composer lands after the copy
  recommendations: 550, // secondary actions finish the scene
};

const HOME_REVEAL = {
  offsetY:  23, // px traveled upward
  blur:     17, // px of initial blur
  duration: 800, // ms for each element to settle
  easing:   "cubic-bezier(0.16, 1, 0.3, 1)",
};

const HOME_REVEAL_DIALS = {
  reveal: {
    blur:    [HOME_REVEAL.blur, 0, 40, 1],
    offsetY: [HOME_REVEAL.offsetY, 0, 60, 1],
    duration: [HOME_REVEAL.duration, 200, 800, 10],
  },
  sequence: {
    helloAt:          [HOME_REVEAL_TIMING.hello, 0, 300, 10],
    questionAt:       [HOME_REVEAL_TIMING.question, 0, 500, 10],
    promptAt:         [HOME_REVEAL_TIMING.prompt, 0, 700, 10],
    recommendationsAt: [HOME_REVEAL_TIMING.recommendations, 0, 900, 10],
  },
  replay: { type: "action", label: "Replay entrance" },
} satisfies DialConfig;

function homeRevealStyle(
  visible: boolean,
  reveal: { blur: number; offsetY: number; duration: number },
): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0)" : `translate3d(0, ${reveal.offsetY}px, 0)`,
    filter: visible ? "blur(0px)" : `blur(${reveal.blur}px)`,
    transition: ["opacity", "transform", "filter"]
      .map((property) => `${property} ${reveal.duration}ms ${HOME_REVEAL.easing}`)
      .join(", "),
  };
}

function EmptyState({ onSend, shuffle, offset }: { onSend: (text: string, id: ScenarioId) => void; shuffle: () => void; offset: number }) {
  const shown = [0, 1, 2].map((i) => SUGGESTION_POOL[(offset + i) % SUGGESTION_POOL.length]);
  const [stage, setStage] = useState(0);
  const [replayTrigger, setReplayTrigger] = useState(0);
  const revealParams = useDialKit("Home entrance", HOME_REVEAL_DIALS, {
    id: "harness-home-entrance-v2",
    persist: true,
    onAction: (action) => {
      if (action === "replay") setReplayTrigger((current) => current + 1);
    },
  });
  useEffect(() => {
    setStage(0);
    const timers = [
      setTimeout(() => setStage(1), revealParams.sequence.helloAt),
      setTimeout(() => setStage(2), revealParams.sequence.questionAt),
      setTimeout(() => setStage(3), revealParams.sequence.promptAt),
      setTimeout(() => setStage(4), revealParams.sequence.recommendationsAt),
    ];

    return () => timers.forEach(clearTimeout);
  }, [
    replayTrigger,
    revealParams.sequence.helloAt,
    revealParams.sequence.questionAt,
    revealParams.sequence.promptAt,
    revealParams.sequence.recommendationsAt,
  ]);

  return (
    <div className="mx-auto flex min-h-full max-w-[720px] flex-col justify-center px-4 py-10 sm:px-8">
      <h1 className="text-[26px] font-normal tracking-[-0.02em] text-ink">
        <span className="home-reveal block text-ink-3" style={homeRevealStyle(stage >= 1, revealParams.reveal)}>Hello {NAME}</span>
        <span className="home-reveal block" style={homeRevealStyle(stage >= 2, revealParams.reveal)}>What can I help you with?</span>
      </h1>

      <div className="home-reveal relative mt-7" style={homeRevealStyle(stage >= 3, revealParams.reveal)}>
        <div className="relative">
          <PromptBar
            demo={false}
            tall
            placeholder="Ask anything about your creamery ops…"
            onSend={(text) => onSend(text, matchScenario(text))}
          />
        </div>
      </div>

      <div className="home-reveal mt-6 flex flex-col" style={homeRevealStyle(stage >= 4, revealParams.reveal)}>
        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              posthog.capture("harness_suggestion_selected");
              onSend(item.label, item.id);
            }}
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

/* ── main ─────────────────────────────────────────────────── */

type Msg = { id: number; role: "user"; text: string } | { id: number; role: "assistant"; scenarioId: ScenarioId };
type Chat = { id: number; title: string | null; messages: Msg[] };

/* the pane arrives on the same beat as the answer it belongs to */
/* The pane shell reserves its space as soon as the message is sent, so the
 * column never reflows mid-thought. Only the body swaps — a quiet loader while
 * the agent works, then the artifact fades up in place. */
function PaneBody({ beat, children }: { beat: number; children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), beat);
    return () => clearTimeout(t);
  }, [beat]);

  if (!show) {
    return (
      <div className="flex h-full items-center justify-center pb-10">
        <LoadingState label="Gathering" variant="Dots" />
      </div>
    );
  }

  return <div style={{ animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both" }}>{children}</div>;
}

/* ── spreadsheet views + property inspector ───────────────────
 * The bottom bar lists views; selecting one swaps the right pane
 * from the assistant chat to a Property configuration inspector.
 */
const SPREADSHEET_VIEWS = [
  { name: "Main", color: "var(--ink-3)", count: 60 },
  { name: "Gelato", color: "oklch(0.627 0.23 296.668)", count: 17 },
  { name: "Wholesale", color: "oklch(0.611 0.21 263.944)", count: 12 },
  { name: "Dairy-free", color: "oklch(0.671 0.118 219.351)", count: 9 },
];

function ConfigSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-4.5 w-7.5 shrink-0 rounded-full transition-colors duration-150"
      style={{ background: on ? "var(--accent)" : "var(--line-strong)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-btn transition-transform duration-150"
        style={{ transform: on ? "translateX(12px)" : "translateX(0)", transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)" }}
      />
    </button>
  );
}

function PropertyConfig({ view, onClose }: { view: string; onClose: () => void }) {
  const [grounding, setGrounding] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ animation: "fade-in 160ms ease-out both" }}>
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3 sm:pl-4">
        <span className="text-[13px] font-semibold text-ink">Property configuration</span>
        <div className="flex items-center gap-0.5 text-ink-3">
          <button type="button" aria-label="Previous" className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <button type="button" aria-label="Next" className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <button
            type="button"
            aria-label="Back to chat"
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="text-[14px] font-semibold text-ink">{view} suppliers</div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-3">Type</span>
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 6h16M4 12h10M4 18h7" /></svg>
              View filter
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-3">Model</span>
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden><path d="M12 3l1.7 5.1a2 2 0 0 0 1.2 1.2L20 11l-5.1 1.7a2 2 0 0 0-1.2 1.2L12 19l-1.7-5.1a2 2 0 0 0-1.2-1.2L4 11l5.1-1.7a2 2 0 0 0 1.2-1.2z" /></svg>
              Sprinkles 5
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-3">Grounding</span>
            <ConfigSwitch on={grounding} onToggle={() => setGrounding((v) => !v)} />
          </div>
        </div>

        <div className="mt-4 rounded-[10px] bg-inset p-3 text-[13px] leading-relaxed text-ink-2 shadow-hairline">
          Only surface <span className="rounded-[5px] bg-accent-tint px-1.5 py-0.5 text-[12px] font-medium text-accent-ink">{view}</span> suppliers with a strong, recent connection — nothing else.
        </div>

        <button
          type="button"
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[9px] text-[12.5px] font-medium text-ink shadow-btn transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>
          Recompute stale fields
        </button>

        <div className="mt-6 flex flex-col gap-1">
          {[
            { label: "Use webhooks to integrate with other tools", icon: <path d="M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z" /> },
            { label: "Configure a Zapier integration", icon: <path d="M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z" /> },
          ].map((row) => (
            <button
              key={row.label}
              type="button"
              className="-mx-1.5 flex items-center gap-2.5 rounded-[8px] px-1.5 py-2 text-left text-[13px] text-ink transition-colors duration-100 hover:bg-hover"
            >
              <span className="text-accent"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>{row.icon}</svg></span>
              {row.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-[9px] bg-red-tint text-[12.5px] font-medium text-red transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></svg>
          Delete property
        </button>
      </div>
    </div>
  );
}

export default function IceCreamHarness() {
  const [chats, setChats] = useState<Chat[]>([{ id: 1, title: null, messages: [] }]);
  const [activeId, setActiveId] = useState(1);
  const [offset, setOffset] = useState(0);
  /* spreadsheet: which view/property is open in the right inspector (null = chat) */
  const [propView, setPropView] = useState<string | null>(null);
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

  /* spreadsheet workspace: table becomes the main pane, chat docks to the right */
  const workspaceMsg = [...chat.messages]
    .reverse()
    .find(
      (m): m is Extract<Msg, { role: "assistant" }> =>
        m.role === "assistant" && !!SCENARIOS[m.scenarioId].Workspace,
    );
  const workspaceScenario = workspaceMsg ? SCENARIOS[workspaceMsg.scenarioId] : null;

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
    posthog.capture("harness_prompt_sent");
    setChats((current) => current.map((c) => (c.id === chat.id ? appendExchange(c, text, scenarioId) : c)));
  };

  /* reopening an existing chat replays it; otherwise recents open in a
   * fresh chat unless the current one is empty */
  const [replay, setReplay] = useState<Record<number, number>>({});
  const pickRecent = (scenarioId: ScenarioId, label: string, prompt = label) => {
    posthog.capture("harness_recent_chat_opened");
    const existing = chats.find((c) => c.title === label);
    if (existing) {
      if (prompt !== label) {
        setChats((current) =>
          current.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  messages: c.messages.map((message) =>
                    message.role === "user" && message.text === label ? { ...message, text: prompt } : message,
                  ),
                }
              : c,
          ),
        );
      }
      setActiveId(existing.id);
      setReplay((current) => ({ ...current, [existing.id]: (current[existing.id] ?? 0) + 1 }));
      return;
    }
    if (chat.messages.length === 0) {
      setChats((current) =>
        current.map((c) => (c.id === chat.id ? appendExchange({ ...c, title: label }, prompt, scenarioId) : c)),
      );
      return;
    }
    const id = (chatIdRef.current += 1);
    setChats((current) => [...current, appendExchange({ id, title: label, messages: [] }, prompt, scenarioId)]);
    setActiveId(id);
  };

  const newChat = () => {
    const id = (chatIdRef.current += 1);
    setChats((current) => [...current, { id, title: null, messages: [] }]);
    setActiveId(id);
  };

  const closeChat = (id: number) => {
    const remaining = chats.filter((c) => c.id !== id);
    if (remaining.length === 0) {
      const nid = (chatIdRef.current += 1);
      setChats([{ id: nid, title: null, messages: [] }]);
      setActiveId(nid);
      return;
    }
    setChats(remaining);
    if (id === activeId) setActiveId(remaining[remaining.length - 1].id);
  };

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat.messages, active]);

  /* switching threads returns the inspector to the chat */
  useEffect(() => setPropView(null), [activeId]);

  /* the tab bar rides the top of the main pane in both layouts */
  const tabBar = (
    <div className="flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-line px-2">
      {chats.map((c) => (
        <div
          key={c.id}
          className={`group/tab flex h-7 shrink-0 items-center gap-0.5 rounded-[7px] pl-2.5 pr-1 text-[12.5px] font-medium transition-colors duration-100 ${
            c.id === activeId ? "bg-hover-2 text-ink" : "text-ink-2 hover:bg-hover hover:text-ink"
          }`}
        >
          <button type="button" aria-pressed={c.id === activeId} onClick={() => setActiveId(c.id)} title={c.title ?? "New chat"} className="min-w-0">
            <span className="block max-w-40 truncate">{c.title ?? "New chat"}</span>
          </button>
          <button
            type="button"
            aria-label="Close tab"
            onClick={() => closeChat(c.id)}
            className={`-my-1 flex size-6 shrink-0 items-center justify-center rounded-[5px] text-ink-3 transition-[opacity,background-color,color] duration-100 hover:bg-hover-2 hover:text-ink ${
              c.id === activeId ? "opacity-100" : "opacity-0 group-hover/tab:opacity-100"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        aria-label="New chat"
        onClick={newChat}
        className="ml-0.5 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
      </button>
    </div>
  );

  /* the message thread + composer — reused as the main column (wide) or the
   * docked assistant panel in spreadsheet mode (narrow) */
  const renderThread = (narrow: boolean) => (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={`flex flex-col gap-8 py-8 ${narrow ? "px-4" : "px-4 sm:px-8 lg:px-12"}`}>
          {chat.messages.map((message) => {
            const full = !narrow && message.role === "assistant" && SCENARIOS[message.scenarioId].fullBleed;
            return (
              <div key={message.id} className={narrow || full ? "w-full" : "mx-auto w-full max-w-[720px]"}>
                {message.role === "user" ? (
                  <UserBubble text={message.text} />
                ) : (
                  <AssistantResponse key={`${message.id}-${replay[chat.id] ?? 0}`} scenarioId={message.scenarioId} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`shrink-0 bg-page ${narrow ? "p-3" : "px-4 pt-3 pb-6 sm:px-8 lg:px-12"}`}>
        <div className={narrow ? "" : "mx-auto max-w-[720px]"}>
          <PromptBar
            demo={false}
            tall
            placeholder="Reply"
            onSend={(text) => send(text, matchScenario(text))}
          />
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex h-[100dvh] gap-0 bg-canvas p-2.5 text-ink lg:pl-0">
      <SidebarNav
        fill
        className="hidden lg:flex"
        recents={RECENTS}
        activeTitle={chat.title}
        onPick={(id, label, prompt) => pickRecent(id as ScenarioId, label, prompt)}
        onNewChat={newChat}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {/* panels row — main pane + docked side pane */}
        <div className="flex min-h-0 flex-1 gap-2.5">
          {workspaceScenario ? (
            <>
              {/* main pane — the live spreadsheet */}
              <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-line bg-page">
                {tabBar}
                <div className="flex min-h-0 flex-1 flex-col">{workspaceScenario.Workspace?.()}</div>
                {/* views — selecting one opens its property inspector on the right */}
                <div className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-t border-line px-2">
                  <button type="button" className="flex h-7 shrink-0 items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] font-medium text-ink-2 transition-colors duration-100 hover:bg-hover hover:text-ink">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 6h16M7 12h10M10 18h4" /></svg>
                    Sort &amp; filter
                  </button>
                  <span className="mx-1 h-4 w-px shrink-0 bg-line" />
                  {SPREADSHEET_VIEWS.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      aria-pressed={propView === v.name}
                      onClick={() => setPropView((current) => (current === v.name ? null : v.name))}
                      className={`flex h-7 shrink-0 items-center gap-1.5 rounded-[7px] px-2.5 text-[12.5px] font-medium transition-colors duration-100 ${
                        propView === v.name ? "bg-hover-2 text-ink" : "text-ink-2 hover:bg-hover hover:text-ink"
                      }`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0"><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M3.5 9.5h17M9.5 9.5v11" /></svg>
                      {v.name}
                      <span className="text-[11px] tabular-nums text-ink-3">{v.count}</span>
                    </button>
                  ))}
                  <button type="button" className="ml-0.5 flex h-7 shrink-0 items-center gap-1.5 rounded-[7px] px-2 text-[12.5px] font-medium text-ink-3 transition-colors duration-100 hover:bg-hover hover:text-ink">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
                    New view
                  </button>
                </div>
              </section>

              {/* right inspector — assistant chat, or a property configurator when a view is selected */}
              <aside
                className="hidden w-[400px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-line bg-page lg:flex"
                style={{ animation: "fade-up 400ms cubic-bezier(0.23,1,0.32,1) both" }}
              >
                {propView ? (
                  <PropertyConfig view={propView} onClose={() => setPropView(null)} />
                ) : (
                  <>
                    <div className="flex h-11 shrink-0 items-center border-b border-line px-4">
                      <span className="text-[13px] font-semibold text-ink">Chat</span>
                    </div>
                    {renderThread(true)}
                  </>
                )}
              </aside>
            </>
          ) : (
            <>
              <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-line bg-page">
                {tabBar}
                {active ? (
                  renderThread(false)
                ) : (
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <EmptyState onSend={send} shuffle={() => setOffset((current) => (current + 3) % SUGGESTION_POOL.length)} offset={offset} />
                  </div>
                )}
              </section>

              {/* artifact pane — its own rounded container */}
              {active && paneMsg && paneScenario?.Pane && (
                  <aside
                    key={`${paneMsg.id}-${replay[chat.id] ?? 0}`}
                    className="hidden w-[360px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-line bg-page lg:flex"
                    style={{ animation: "fade-in 300ms ease both" }}
                  >
                    <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-3 sm:pl-4">
                      <span className="text-[13px] font-semibold text-ink">{paneScenario.paneTitle}</span>
                      <div className="flex items-center gap-0.5 text-ink-3">
                        <button type="button" aria-label="Previous" className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
                        </button>
                        <button type="button" aria-label="Next" className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
                        </button>
                        <button type="button" aria-label="Pane options" className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Close pane"
                          onClick={() => setClosedPaneId(paneMsg.id)}
                          className="flex size-6 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-hover hover:text-ink"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                      <PaneBody beat={paneScenario.beat}>{paneScenario.Pane()}</PaneBody>
                    </div>
                  </aside>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
