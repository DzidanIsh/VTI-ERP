import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "brand",
  trend,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: "brand" | "amber" | "sky" | "violet" | "rose";
  trend?: { value: string; up: boolean };
  /** Bila diisi, seluruh kartu jadi tautan (mis. antrian validasi -> halaman Validasi). */
  href?: string;
}) {
  const accents: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    rose: "bg-rose-50 text-rose-600",
  };
  const kartu = (
    <Card
      className={cn(
        "p-5 transition-shadow hover:shadow-cardhover",
        href && "cursor-pointer hover:border-brand-300"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">{value}</p>
          {sub && (
            <p className={cn("mt-1 text-xs", href ? "font-medium text-brand-600" : "text-slate-400")}>
              {sub}
              {href && <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" />}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                trend.up ? "text-brand-600" : "text-rose-600"
              )}
            >
              {trend.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend.value}
            </p>
          )}
        </div>
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", accents[accent])}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
  );

  return href ? <Link href={href} className="block">{kartu}</Link> : kartu;
}
