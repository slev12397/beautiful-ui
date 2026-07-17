import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-12 pb-9 sm:pt-16">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Beautiful UI
        </h1>
        <p className="hidden text-[13px] text-ink-3 sm:block">
          Crafted primitives for AI-native interfaces — copy, paste, ship.
        </p>
      </div>
      <ThemeToggle />
    </header>
  );
}
