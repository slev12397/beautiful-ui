import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Grid } from "@/components/site/Grid";
import { Nav } from "@/components/site/Nav";
import { EmailCapture } from "@/components/site/EmailCapture";
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
        <aside className="flex flex-col border-b border-dashed border-line px-7 pt-16 pb-7 lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:border-r lg:border-b-0 lg:pt-[clamp(2.5rem,8vh,5rem)]">
          <div className="shrink-0">
            <div className="flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Beautiful UI"
                className="-ml-3 size-20 shrink-0 lg:ml-0"
              />
              <ThemeToggle />
            </div>

            <h1 className="mt-12 text-[21px] leading-snug font-semibold tracking-[-0.02em] text-ink text-balance lg:mt-[clamp(1.5rem,5vh,3rem)]">
              Beautiful UI for AI-native interfaces.
            </h1>
          </div>

          <div className="relative mt-7 border-t border-dashed border-line pt-6 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pt-0">
            <div className="component-nav-scroll lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pt-6 lg:pb-16">
              <Nav />
            </div>
          </div>

          <div className="mt-8 shrink-0 lg:mt-6">
            <a
              href="https://turbodesign.co/"
              target="_blank"
              rel="noreferrer"
              className="block rounded-control px-2 py-1"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="block truncate text-[12.5px] font-medium leading-tight text-ink">
                    Built by Turbo
                  </span>
                  <span
                    aria-hidden
                    className="relative h-3 w-6 shrink-0 overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/turbo-flourish.png"
                      alt=""
                      className="absolute top-1/2 left-0 w-9 max-w-none -translate-y-[46%]"
                    />
                  </span>
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

        {/* right — the components, then the signup at the end of the scroll */}
        <div className="min-w-0">
          <Grid sources={sources} />
          <EmailCapture />

          {/* footer — lives in the scroll column so the sticky rail is untouched */}
          <footer className="flex items-center justify-between gap-4 border-t border-dashed border-line px-8 py-6">
            <span className="text-[12px] text-ink-3">© 2026 Beautiful UI</span>
            <Link
              href="/license"
              className="text-[12px] text-ink-3 transition-colors duration-150 hover:text-ink"
            >
              MIT License
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
