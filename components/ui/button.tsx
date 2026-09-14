import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "subtle";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
