import type { ReactNode } from "react";

/**
 * Badge — a small status pill. Five tones mapped to the status token families
 * (neutral / brand / success / warning / error). A basic starting point.
 */

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "error";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-inset text-fg-secondary",
  brand: "bg-brand-subtle text-brand-strong",
  success: "bg-success-light text-success-strong",
  warning: "bg-warning-light text-warning-strong",
  error: "bg-error-light text-error-strong",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-sm py-tiny text-2xs font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
