"use client";

import { useRef } from "react";
import { useGlimm } from "glimm/react";

/* Plays a glimm sweep across the viewport when the pointer enters —
 * a no-op navigate, so it's purely the visual band. Guarded so a
 * single hover fires once and can't restack mid-sweep. */

export function GlimmHover({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { sweep } = useGlimm();
  const running = useRef(false);

  const play = () => {
    if (running.current) return;
    running.current = true;
    const handle = sweep(() => {});
    handle.done.finally(() => {
      running.current = false;
    });
  };

  return (
    <div className={className} onMouseEnter={play} onFocusCapture={play}>
      {children}
    </div>
  );
}
