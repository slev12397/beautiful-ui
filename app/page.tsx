import fs from "node:fs";
import path from "node:path";
import { Hero } from "@/components/site/Hero";
import { Grid } from "@/components/site/Grid";
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
    <main className="pb-6">
      <Hero />
      <div className="pt-12">
        <Grid sources={sources} />
      </div>
      <footer className="mx-auto mt-14 flex w-full max-w-6xl items-center justify-between border-t border-line px-6 pt-6 pb-10">
        <span className="text-[13px] text-ink-3">
          Beautiful UI — simple is beautiful.
        </span>
        <span className="text-[13px] text-ink-3">
          Built from primitives. Copy anything.
        </span>
      </footer>
    </main>
  );
}
