import { ThemeToggle } from "./ThemeToggle";

/* ─────────────────────────────────────────────────────────
 * HERO — Attio-style eclipse band. Always dark, both themes.
 * Wordmark + toggle up top, huge headline, gradient arc
 * (eclipse horizon) with a blurred glow duplicate, then a
 * 4-up feature strip resting above the arc's baseline.
 * ───────────────────────────────────────────────────────── */

const FEATURES: { icon: React.ReactNode; title: string; sub: string }[] = [
  {
    icon: (
      <g>
        <rect x="9" y="9" width="12" height="12" rx="2.5" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </g>
    ),
    title: "Copy, paste, ship.",
    sub: "Every primitive is one self-contained file.",
  },
  {
    icon: (
      <g>
        <rect x="2" y="4" width="20" height="16" rx="2.5" />
        <path d="M8 4v16M16 4v16" />
      </g>
    ),
    title: "Every state, storyboarded.",
    sub: "Demos loop through real behavior.",
  },
  {
    icon: (
      <g>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" opacity="0.25" />
        <path d="M12 3v18" />
      </g>
    ),
    title: "One token set.",
    sub: "Light and dark from the same variables.",
  },
  {
    icon: (
      <g>
        <path d="M4 4l7.5 18 2.2-7.3L21 12.5 4 4z" />
      </g>
    ),
    title: "Interactable, not screenshots.",
    sub: "Hover, click, and switch variants live.",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0d0e10] text-white">
      {/* vertical hairline columns */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 96px)",
        }}
      />

      {/* top row — wordmark + theme toggle */}
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
          Beautiful UI
        </span>
        <ThemeToggle />
      </div>

      {/* headline */}
      <div className="relative pt-16 pb-0">
        <p className="text-center text-[14px] text-[#9a9da3]">
          The only component set with
        </p>
        <h1 className="mt-2 text-center text-[56px] leading-none font-semibold tracking-[-0.03em] text-white sm:text-[84px]">
          Universal Craft<span className="align-super text-[0.35em]">™</span>
        </h1>

        {/* eclipse arc */}
        <svg
          viewBox="0 0 1100 300"
          className="mx-auto mt-10 w-full max-w-5xl"
          aria-hidden
        >
          <defs>
            <linearGradient id="eclipse-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="35%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <filter id="eclipse-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <ellipse
            cx="550" cy="900" rx="850" ry="750"
            fill="#0d0e10" stroke="url(#eclipse-stroke)" strokeWidth="6"
            opacity="0.35" filter="url(#eclipse-glow)"
          />
          <ellipse
            cx="550" cy="900" rx="850" ry="750"
            fill="#0d0e10" stroke="url(#eclipse-stroke)" strokeWidth="2"
          />
        </svg>
      </div>

      {/* feature strip — sits above the arc's baseline */}
      <div className="relative z-10 -mt-24 mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-white/8 border-t border-white/8 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="p-6">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#9a9da3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            >
              {f.icon}
            </svg>
            <p className="mt-3 text-[14px] font-medium text-white">{f.title}</p>
            <p className="mt-1 text-[13px] text-[#9a9da3]">{f.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
