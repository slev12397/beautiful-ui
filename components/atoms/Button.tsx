"use client";

import { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "success";
type Size = "sm" | "md";

const filledShadow = "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]";

const variants: Record<ButtonVariant, string> = {
  primary:
    `bg-ink text-canvas hover:opacity-90 dark:bg-ink dark:text-canvas ${filledShadow}`,
  secondary:
    "bg-surface text-ink shadow-btn hover:bg-inset aria-expanded:bg-hover",
  ghost: "text-ink-2 hover:bg-line/60 hover:text-ink",
  accent: `bg-accent text-white hover:bg-accent-ink ${filledShadow}`,
  success: `bg-green text-white hover:brightness-95 ${filledShadow}`,
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-3 text-[13px] rounded-control gap-1.5",
  md: "h-9 px-4 text-sm rounded-control gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
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
