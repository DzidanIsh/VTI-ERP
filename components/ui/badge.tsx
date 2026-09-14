import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "brand"
  | "maintenance"
  | "operative"
  | "breakdown"
  | "amber"
  | "rose"
  | "sky"
  | "violet"
  | "slate";

const variants: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-600",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  maintenance: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  operative: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  breakdown: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  sky: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  slate: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
