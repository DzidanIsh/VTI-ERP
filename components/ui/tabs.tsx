"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  initial,
  className,
  children,
}: {
  tabs: { id: string; label: string }[];
  initial?: string;
  className?: string;
  children: (active: string) => React.ReactNode;
}) {
  const [active, setActive] = React.useState<string>(initial ?? tabs[0].id);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative -mb-px px-4 py-2.5 text-sm font-medium transition-colors",
              active === t.id
                ? "border-b-2 border-brand-600 text-brand-700"
                : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4 animate-fade-in">{children(active)}</div>
    </div>
  );
}
