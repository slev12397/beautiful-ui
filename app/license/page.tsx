import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

/* The license text is read from the repo's LICENSE file at build time, so
 * this page and the actual license can never drift apart. */
function readLicense(): string {
  return fs.readFileSync(path.join(process.cwd(), "LICENSE"), "utf8").trim();
}

export const metadata = {
  title: "License — Beautiful UI",
  description: "Beautiful UI components are released under the MIT License.",
};

export default function LicensePage() {
  const license = readLicense();

  return (
    <main className="mx-auto min-h-dvh max-w-[720px] bg-page px-6 py-8 shadow-[0_0_0_1px_var(--line)] sm:px-8 lg:px-10">
      <header className="py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Back
        </Link>

        <h1 className="mt-8 text-[21px] leading-snug font-semibold tracking-[-0.02em] text-ink text-balance">
          Yes, you can use it for free.
        </h1>
      </header>

      <section className="border-t border-dashed border-line py-8">
        <div className="overflow-hidden rounded-window bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line bg-inset px-4 py-2.5">
            <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-3">
              MIT License
            </span>
            <span className="font-mono text-[11.5px] text-ink-3">LICENSE</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap px-5 py-5 font-mono text-[12.5px] leading-relaxed text-ink-2">
            {license}
          </pre>
        </div>
      </section>
    </main>
  );
}
