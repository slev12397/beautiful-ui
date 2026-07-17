import fs from "node:fs";
import path from "node:path";
import { Grid } from "@/components/site/Grid";
import { Nav } from "@/components/site/Nav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { META } from "@/lib/meta";

/* Sources are read at build time (static export) so every card
 * can offer its own copy-paste-able file. */
function readSources(): Record<string, string> {
  const dir = path.join(process.cwd(), "components", "primitives");
  return Object.fromEntries(
    META.map((entry) => [
      entry.id,
      fs.readFileSync(path.join(dir, entry.file), "utf8"),
    ]),
  );
}

export default function Home() {
  const sources = readSources();

  return (
    <main className="relative mx-auto max-w-[960px] bg-page shadow-[0_0_0_1px_var(--line)]">
      <div className="lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
        {/* left rail — the system, then the component nav */}
        <aside className="flex flex-col border-b border-dashed border-line px-7 pt-16 pb-7 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0 lg:pt-20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="flex size-5.5 items-center justify-center rounded-[6px] bg-ink text-canvas">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </span>
              <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
                Beautiful UI
              </span>
            </span>
            <ThemeToggle />
          </div>

          <h1 className="mt-12 text-[21px] leading-snug font-semibold tracking-[-0.02em] text-ink text-balance">
            Crafted primitives for AI-native interfaces.
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2 text-pretty">
            Thinking states, approvals, streaming, and everything agents need
            to talk to humans. Every primitive is one self-contained file —
            copy, paste, ship.
          </p>

          <div className="mt-7 border-t border-dashed border-line pt-6">
            <Nav />
          </div>

          <div className="mt-8 lg:mt-auto">
            <a
              href="https://turbodesign.co/"
              target="_blank"
              rel="noreferrer"
              className="-mx-1.5 block rounded-control px-1.5 py-1"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="block truncate text-[12.5px] font-medium leading-tight text-ink">
                  Built by Turbo
                </span>
                <span className="block truncate text-[12px] leading-tight text-ink-2">
                  Product design studio
                </span>
              </span>
              <span className="mt-1.5 block text-[12px] leading-relaxed text-ink-2 text-pretty">
                Get expert product design for your business.
              </span>
            </a>
            <a
              href="https://cal.com/shane-levine-7bnfdw/30min?overlayCalendar=true"
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-full bg-field px-2.5 text-[11.5px] font-medium text-ink
                shadow-btn transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.96]"
            >
              Book a call
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </aside>

        {/* right — the components, one per row */}
        <Grid sources={sources} />
      </div>
    </main>
  );
}
