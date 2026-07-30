"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

/* Dev-only visual feedback toolbar (agentation): click elements, add notes,
 * copy structured output for AI editing. The dynamic import lives inside a
 * `NODE_ENV === "development"` guard so webpack dead-code-eliminates it in
 * production builds — the module never ships to prod. */
export function DevToolbar() {
  const [Toolbar, setToolbar] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("agentation").then((m) => setToolbar(() => m.Agentation));
    }
  }, []);

  const T = Toolbar;
  return T ? <T /> : null;
}
