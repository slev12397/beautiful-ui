"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { META } from "@/lib/meta";

/* Component nav — anchors into the list, scrollspy highlights
 * the section in view, and a single pill glides to whichever
 * item the pointer is over (falling back to the active one). */

export function Nav() {
  const [active, setActive] = useState(META[0].id);
  const [hovered, setHovered] = useState<string | null>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    META.forEach((m) => {
      const el = document.getElementById(m.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // position the gliding pill on the hovered item, else the active one
  useLayoutEffect(() => {
    const target = itemRefs.current[hovered ?? active];
    if (target) setBox({ top: target.offsetTop, height: target.offsetHeight });
  }, [hovered, active]);

  return (
    <nav aria-label="Components">
      <p className="mb-2 text-[11.5px] text-ink-3">Components</p>
      <ul
        ref={listRef}
        onMouseLeave={() => setHovered(null)}
        className="relative flex flex-col"
      >
        {/* single gliding highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-[7px] bg-hover"
          style={{
            top: box?.top ?? 0,
            height: box?.height ?? 0,
            opacity: box ? 1 : 0,
            transition:
              "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
          }}
        />
        {META.map((m) => (
          <li
            key={m.id}
            ref={(el) => {
              itemRefs.current[m.id] = el;
            }}
          >
            <a
              href={`#${m.id}`}
              onMouseEnter={() => setHovered(m.id)}
              onFocus={() => setHovered(m.id)}
              onBlur={() => setHovered(null)}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(m.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`relative z-10 flex items-center rounded-[7px] px-2 py-[5px]
                text-[12.5px] transition-colors duration-150
                ${active === m.id ? "font-medium text-ink" : "text-ink-2 hover:text-ink"}`}
            >
              {m.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
