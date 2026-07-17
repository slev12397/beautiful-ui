"use client";

import type { ComponentType } from "react";
import { META, type Meta } from "./meta";
import LoadingState from "@/components/primitives/LoadingState";
import ThinkingState from "@/components/primitives/ThinkingState";
import StreamingText from "@/components/primitives/StreamingText";
import ChatComposer from "@/components/primitives/ChatComposer";
import ApprovalCard from "@/components/primitives/ApprovalCard";
import TaskRows from "@/components/primitives/TaskRows";
import RecommendationCard from "@/components/primitives/RecommendationCard";
import ContextCards from "@/components/primitives/ContextCards";
import DiffTable from "@/components/primitives/DiffTable";
import FineTuneCard from "@/components/primitives/FineTuneCard";
import FilterTable from "@/components/primitives/FilterTable";
import SidebarNav from "@/components/primitives/SidebarNav";
import WelcomeModal from "@/components/primitives/WelcomeModal";
import InsightCards from "@/components/primitives/InsightCards";
import CodeBlock from "@/components/primitives/CodeBlock";
import ToolChips from "@/components/primitives/ToolChips";
import SearchList from "@/components/primitives/SearchList";

export type Entry = Meta & { Demo: ComponentType<{ variant?: string }> };

const DEMOS: Record<string, ComponentType<{ variant?: string }>> = {
  "loading-state": LoadingState,
  "thinking-state": ThinkingState,
  "streaming-text": StreamingText,
  "chat-composer": ChatComposer,
  "approval-card": ApprovalCard,
  "task-rows": TaskRows,
  "recommendation-card": RecommendationCard,
  "context-cards": ContextCards,
  "diff-table": DiffTable,
  "fine-tune-card": FineTuneCard,
  "filter-table": FilterTable,
  "sidebar-nav": SidebarNav,
  "welcome-modal": WelcomeModal,
  "insight-cards": InsightCards,
  "code-block": CodeBlock,
  "tool-chips": ToolChips,
  "search": SearchList,
};

export const REGISTRY: Entry[] = META.map((m) => ({ ...m, Demo: DEMOS[m.id] }));
