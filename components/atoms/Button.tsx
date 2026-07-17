"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas hover:opacity-90 shadow-hairline dark:bg-ink dark:text-canvas",
  secondary:
    "bg-surface text-ink shadow-hairline hover:bg-inset",
  ghost: "text-ink-2 hover:bg-line/60 hover:text-ink",
  accent: "bg-accent text-white hover:bg-accent-ink shadow-hairline",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-control gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium select-none
        transition-[transform,background-color,opacity] duration-150 ease-out
        active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
