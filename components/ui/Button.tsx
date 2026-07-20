"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Button — the starter action control. Three variants (primary / secondary /
 * ghost) × two sizes. Styled entirely from the semantic design tokens
 * (globals.css), so it re-themes for dark automatically. A basic starting
 * point — extend with icons, loading state, etc. as the project needs.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-main text-fg-white hover:bg-brand-strong border border-transparent",
  secondary:
    "bg-surface-top text-fg-primary border border-edge-stronger hover:bg-surface-inset",
  ghost: "bg-transparent text-fg-secondary border border-transparent hover:bg-surface-inset",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "text-xs px-md py-xs gap-xs",
  md: "text-sm px-lg py-sm gap-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-panel font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
