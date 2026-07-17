"use client";

import { useEffect, useState } from "react";
import { META } from "@/lib/meta";

/* Component nav — anchors into the list, scrollspy highlights
 * the section currently in view. */

export function Nav() {
  const [active, setActive] = useState(META[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    META.forEach((m) => {
      const el = document.getElementById(m.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Components">
      <p className="mb-1.5 text-[11.5px] text-ink-3">Components</p>
      <ul className="flex flex-col">
        {META.map((m) => (
          <li key={m.id}>
            <a
              href={`#${m.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(m.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`-mx-2 flex items-center rounded-[6px] px-2 py-[3px] text-[12.5px]
                transition-colors duration-100
                ${active === m.id ? "bg-hover font-medium text-ink" : "text-ink-2 hover:bg-hover hover:text-ink"}`}
            >
              {m.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
