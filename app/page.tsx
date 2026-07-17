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
    <main className="mx-auto max-w-[1200px] border-x border-dashed border-line px-0">
      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* left rail — the system, then the component nav */}
        <aside className="border-b border-dashed border-line px-7 pt-10 pb-8 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
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

          <h1 className="mt-10 text-[22px] leading-snug font-semibold tracking-[-0.02em] text-ink text-balance">
            Crafted primitives for AI-native interfaces.
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2 text-pretty">
            Thinking states, approvals, streaming, and everything agents need
            to talk to humans. Every primitive is one self-contained file —
            copy, paste, ship.
          </p>

          <dl className="mt-6 flex flex-col gap-2.5 border-t border-dashed border-line pt-5">
            {[
              ["Every state, storyboarded", "demos loop through real behavior"],
              ["One token set", "light and dark from the same variables"],
              ["Interactable, not screenshots", "hover, click, switch variants"],
            ].map(([t, d]) => (
              <div key={t} className="text-[12.5px] leading-snug">
                <dt className="font-medium text-ink">{t}.</dt>
                <dd className="text-ink-3">{d}.</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 border-t border-dashed border-line pt-5">
            <Nav />
          </div>
        </aside>

        {/* right — the components, one per row */}
        <Grid sources={sources} />
      </div>

      <footer className="flex items-center justify-between border-t border-dashed border-line px-7 py-6">
        <span className="text-[12.5px] text-ink-3">
          Beautiful UI — simple is beautiful.
        </span>
        <span className="text-[12.5px] text-ink-3">
          Built from primitives. Copy anything.
        </span>
      </footer>
    </main>
  );
}
