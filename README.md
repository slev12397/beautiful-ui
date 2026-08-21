# Beautiful UI

Crafted, copy-paste interface primitives for AI-native products — thinking and
reasoning states, streaming answers, human-in-the-loop approvals, tool-call and
task status, records and diff tables, prompt bars, and more — plus a live
**harness** that arranges them into a working agent chat.

Everything is one self-contained component per primitive, built on a small
design-token layer. MIT licensed. Take it, wire it to your own agent, ship it.

- **Gallery:** every primitive as a live, copy-paste demo — `/`
- **Harness:** the primitives composed into an agent chat — `/harness`

## Quick start

```bash
git clone https://github.com/slev12397/beautiful-ui.git
cd beautiful-ui
npm install
npm run dev
```

Open http://localhost:3000. Analytics and email capture are optional (see
[Environment](#environment)) — but note the icon set below is not.

> **Heads up — commercial icon set.** `SidebarNav` uses
> [`@central-icons-react`](https://centralicons.com), a paid icon library with
> a license check that runs on `npm install`. Set `CENTRAL_LICENSE_KEY` in your
> environment before installing, **or** swap those imports in
> `components/primitives/SidebarNav.tsx` for your own icons. Everything else
> runs with no configuration.

Stack: Next.js (App Router) · React · Tailwind CSS v4 · TypeScript.

## What's in here

```
app/
  globals.css              design tokens (:root, .dark, @theme) + component CSS
  layout.tsx               fonts (Inter + JetBrains Mono), theme boot
  page.tsx                 the gallery
  harness/page.tsx         the harness route
components/
  primitives/*             the library — one self-contained file per primitive
  site/*                   the shell/chrome (harness, gallery grid, theme, sounds)
lib/
  meta.ts, registry.tsx    the gallery catalog
```

The primitives are the product. Each file under `components/primitives/` is
designed to be pasted into another project with no dependency beyond the
foundation stylesheet `app/globals.css` — copy that once first (see
[One-time setup](#one-time-setup)), then paste any component on top.

## The design system

Tokens live in `app/globals.css` as Tailwind v4 `@theme` variables, themed for
light and dark from the same source:

- **Cool, blue-tinted neutrals**, solid hairline borders (not alpha), one blue
  accent, semantic color (green/orange/red) used sparingly.
- **Tight radii** — chip `6` · control `8` · card `10` · window `14` · pill.
- **Restrained, layered shadows** — hairline · btn · card · raised · overlay.
- **Type** — Inter (tight tracking, tabular numerals) + JetBrains Mono.

### One-time setup

A single component is **not** self-contained on its own — it renders on this
shared foundation stylesheet. Before pasting any primitive, drop
[`app/globals.css`](https://github.com/slev12397/beautiful-ui/blob/main/app/globals.css)
into your project **in full, once**. It contains everything the components rely on:

- `@import "tailwindcss"` and `@import "shadow-plugin/unprefixed"` (the smooth
  `--shadow-xs … --shadow-lg` scale that `shadow-card` / `shadow-overlay` build on)
- the `:root` / `.dark` variables **and** the `@theme inline` block that maps them
  to the utilities (`bg-ink`, `text-ink-3`, `shadow-overlay`, `rounded-window`, …)
- every `@keyframes` (`pop-in`, `fade-up`, `shimmer-text`, `pixel-on`, `stream-in`, …)
  and the `prefers-reduced-motion` fallbacks

The `:root`/`.dark` variables **alone won't work** — the `@theme inline` block is
what makes those utility classes exist. It's framework-agnostic: the same file
works in Vue, Svelte, or plain HTML on Tailwind v4.

## Wiring the harness to a real agent

`components/site/IceCreamHarness.tsx` is a demo: a `SCENARIOS` map turns fake
prompts into scripted replies built from the primitives. To make it real,
replace the demo data with your backend — the primitives stay exactly as they
are; they're just the rendering layer for your agent's output.

| Demo seam | Replace with |
| --- | --- |
| `SCENARIOS` / `matchScenario` in `IceCreamHarness.tsx` | your agent request per user message |
| `StreamingText` / `StreamLine` | your token stream (SSE or the [AI SDK](https://ai-sdk.dev) `streamText`) |
| `ThinkingState` | your agent's reasoning / step events |
| `ToolChips` | your tool-call events and their results |
| `ApprovalCard` | your human-in-the-loop confirmations |
| `ContextCards` | your retrieval / memory chunks |
| `RecordsTable` / `DiffTable` | your data and proposed edits |
| model picker in `PromptBar` | your available models |

A typical production wiring:

1. **Models** — call your LLM from a Next.js route or Server Action. On Vercel,
   the [AI SDK](https://ai-sdk.dev) + AI Gateway lets you use `"provider/model"`
   strings and stream tokens straight into `StreamingText`.
2. **Streaming** — stream tokens (SSE / `ReadableStream`) into the streaming
   primitives; they render word-by-word as data arrives.
3. **Tools & approvals** — map your agent's tool-call and confirmation events
   onto `ToolChips`, `ThinkingState`, and `ApprovalCard`.
4. **Memory & context** — feed your retrieval/memory results into `ContextCards`
   and the side pane; persist threads however you like (the harness keeps them
   in local state for the demo).
5. **Data** — point `RecordsTable` / `DiffTable` at your real rows.

## Environment

All optional. Copy `.env.example` to `.env.local` to enable them.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog analytics (client) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host |
| `RESEND_API_KEY` | email capture via Resend (server-only) |

Without them, analytics is disabled and the email-capture endpoint returns a
graceful "unavailable" — nothing crashes.

## License

MIT — see [LICENSE](./LICENSE). Built by [Turbo](https://turbodesign.co).
