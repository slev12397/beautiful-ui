"use client";

import { useState } from "react";
import ApprovalCard from "@/components/primitives/ApprovalCard";
import ChatComposer from "@/components/primitives/ChatComposer";
import CodeBlock from "@/components/primitives/CodeBlock";
import ContextCards from "@/components/primitives/ContextCards";
import DiffTable from "@/components/primitives/DiffTable";
import FilterTable from "@/components/primitives/FilterTable";
import FineTuneCard from "@/components/primitives/FineTuneCard";
import InsightCards from "@/components/primitives/InsightCards";
import LoadingState from "@/components/primitives/LoadingState";
import RecommendationCard from "@/components/primitives/RecommendationCard";
import RecordsTable from "@/components/primitives/RecordsTable";
import SearchList from "@/components/primitives/SearchList";
import SidebarNav from "@/components/primitives/SidebarNav";
import StreamingText from "@/components/primitives/StreamingText";
import TaskRows from "@/components/primitives/TaskRows";
import ThinkingState from "@/components/primitives/ThinkingState";
import ToolChips from "@/components/primitives/ToolChips";

function Spark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-ink text-surface shadow-hairline ${className}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
      </svg>
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-300"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function AssistantMessage({
  eyebrow,
  children,
  className = "",
}: {
  eyebrow: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`flex gap-3 ${className}`} style={{ animation: "fade-up 450ms cubic-bezier(0.23,1,0.32,1) both" }}>
      <Spark className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.09em] text-ink-3">{eyebrow}</span>
        {children}
      </div>
    </article>
  );
}

function SectionHeading({
  number,
  title,
  detail,
}: {
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <span className="font-mono text-[10.5px] tabular-nums text-ink-3">{number}</span>
      <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      <span className="truncate text-[12px] text-ink-3">{detail}</span>
    </div>
  );
}

function ContextRail() {
  return (
    <aside className="hidden w-[304px] shrink-0 border-l border-line bg-canvas/45 px-5 py-6 2xl:block">
      <div className="sticky top-6 flex flex-col gap-7">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ink">Workspace search</span>
            <kbd className="rounded-[5px] bg-field px-1.5 py-0.5 font-mono text-[10px] text-ink-3 shadow-hairline">⌘ K</kbd>
          </div>
          <SearchList />
        </div>

        <div>
          <SectionHeading number="01" title="Context" detail="3 sources" />
          <ContextCards />
        </div>

        <div>
          <SectionHeading number="02" title="Tune response" detail="live inspector" />
          <FineTuneCard />
        </div>
      </div>
    </aside>
  );
}

export default function ChatExperience() {
  const [runOpen, setRunOpen] = useState(true);

  return (
    <main className="min-h-screen bg-page p-3 text-ink sm:p-5 lg:p-7">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] overflow-hidden rounded-window bg-page shadow-overlay sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3.5rem)]">
        <div className="hidden shrink-0 border-r border-line bg-canvas/35 lg:block">
          <SidebarNav fill />
        </div>

        <section className="flex min-w-0 flex-1 flex-col bg-page">
          <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-line px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" aria-label="Open workspace navigation" className="flex size-8 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink lg:hidden">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-ink">Pistachio expansion</span>
                  <span className="rounded-full bg-green-tint px-2 py-0.5 text-[10.5px] font-medium text-green">Live</span>
                </div>
                <span className="block truncate text-[11.5px] text-ink-3">Flavor strategy · updated moments ago</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" className="hidden h-8 items-center gap-1.5 rounded-control bg-field px-2.5 text-[12px] font-medium text-ink-2 shadow-btn transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.97] sm:flex">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v18M3 12h18" /></svg>
                New chat
              </button>
              <button type="button" aria-label="Share conversation" className="flex size-8 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.9 7.5-4.6M8.2 13.1l7.5 4.6" /></svg>
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="mx-auto max-w-[820px] px-4 py-8 pb-10 sm:px-8 sm:py-10 lg:px-12">
                <div className="mb-8 flex justify-end pl-10 sm:pl-24">
                  <div className="rounded-xl bg-field px-3.5 py-2 text-[13px] leading-relaxed text-ink shadow-hairline">
                    Where should we expand pistachio this summer, and what needs to change before we commit?
                  </div>
                </div>

                <AssistantMessage eyebrow="Scoop · analysis complete">
                  <p className="max-w-[620px] text-[14px] leading-[1.65] text-ink">
                    I pulled together the seasonal signal, supplier context, and the current maker records. Pistachio is the clearest expansion bet, but I’d tighten the cone supply and update the launch set before committing.
                  </p>

                  <div className="mt-5 rounded-card bg-canvas/70 p-3 shadow-hairline sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="block text-[12px] font-semibold text-ink">Research run</span>
                        <span className="block text-[11px] text-ink-3">A small trail of work, kept close to the answer</span>
                      </div>
                      <button type="button" aria-expanded={runOpen} onClick={() => setRunOpen((current) => !current)} className="flex h-7 items-center gap-1.5 rounded-control bg-surface px-2 text-[11.5px] font-medium text-ink-2 shadow-btn transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.97]">
                        {runOpen ? "Hide details" : "Show details"}
                        <Chevron open={runOpen} />
                      </button>
                    </div>
                    <div className="grid transition-[grid-template-rows,opacity] duration-400" style={{ gridTemplateRows: runOpen ? "1fr" : "0fr", opacity: runOpen ? 1 : 0 }}>
                      <div className="min-h-0 overflow-hidden">
                        <div className="mt-4 flex flex-col gap-5 border-t border-line pt-4">
                          <div>
                            <SectionHeading number="01" title="Thinking" detail="agent trace" />
                            <ThinkingState variant="Search" />
                          </div>
                          <div>
                            <SectionHeading number="02" title="Tools" detail="4 calls · 2 messages" />
                            <ToolChips />
                          </div>
                          <LoadingState label="Building the comparison" variant="Dots" />
                        </div>
                      </div>
                    </div>
                  </div>
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · key signal" className="mt-12">
                  <div className="max-w-[630px]">
                    <StreamingText />
                  </div>
                  <div className="mt-5">
                    <SectionHeading number="03" title="Seasonal signal" detail="last 3 summers" />
                    <InsightCards />
                  </div>
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · recommendation" className="mt-12">
                  <p className="mb-4 max-w-[600px] text-[13px] leading-relaxed text-ink-2">The strongest move is to secure cones from the reliable supplier first, then promote the hero flavor where weekend demand is already doing the work.</p>
                  <RecommendationCard />
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · needs your call" className="mt-12">
                  <p className="mb-4 max-w-[600px] text-[13px] leading-relaxed text-ink-2">Before I write the launch batch, confirm the size of the flavor set and the first market to test.</p>
                  <ApprovalCard />
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · preparing the change" className="mt-12">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="max-w-[480px] text-[13px] leading-relaxed text-ink-2">I’ll stage the new flavor records, filter the makers that are ready, and leave the proposed edits for review.</p>
                    <span className="hidden rounded-full bg-accent-tint px-2 py-0.5 text-[10.5px] font-medium text-accent-ink sm:block">Draft</span>
                  </div>
                  <div className="flex flex-col gap-6">
                    <div>
                      <SectionHeading number="04" title="Tasks" detail="agent checklist" />
                      <TaskRows />
                    </div>
                    <div>
                      <SectionHeading number="05" title="Proposed edits" detail="review before apply" />
                      <DiffTable />
                    </div>
                  </div>
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · maker records" className="mt-12">
                  <p className="mb-5 max-w-[600px] text-[13px] leading-relaxed text-ink-2">Here’s the working set. The filters and full records table are connected so you can narrow the launch set without leaving the thread.</p>
                  <div className="flex flex-col gap-7">
                    <div>
                      <SectionHeading number="06" title="Launch filter" detail="electric tags" />
                      <div className="overflow-x-auto pb-1"><FilterTable /></div>
                    </div>
                    <div>
                      <SectionHeading number="07" title="Maker records" detail="26 makers" />
                      <div className="overflow-x-auto pb-1"><RecordsTable /></div>
                    </div>
                  </div>
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · batch plan" className="mt-12">
                  <p className="mb-4 max-w-[600px] text-[13px] leading-relaxed text-ink-2">Once the records are approved, this is the small batch function I’ll use to stage the pistachio run.</p>
                  <CodeBlock />
                </AssistantMessage>

                <AssistantMessage eyebrow="Scoop · ready when you are" className="mt-12">
                  <p className="mb-4 max-w-[600px] text-[13px] leading-relaxed text-ink-2">Everything is staged as a reviewable draft. Ask for a change, or send a new instruction below to keep going.</p>
                  <ChatComposer />
                </AssistantMessage>
              </div>
            </div>
            <ContextRail />
          </div>
        </section>
      </div>
    </main>
  );
}
