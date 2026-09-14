import { Wrench, CheckCircle2, AlertTriangle, type LucideIcon } from "lucide-react";
import { MINING_ASSETS } from "@/lib/mock-data/mining";
import type { AssetStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: {
  status: AssetStatus;
  title: string;
  Icon: LucideIcon;
  head: string;
  dot: string;
}[] = [
  { status: "maintenance", title: "Maintenance", Icon: Wrench, head: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  { status: "operative", title: "Operative", Icon: CheckCircle2, head: "bg-brand-50 text-brand-700 border-brand-200", dot: "bg-brand-500" },
  { status: "breakdown", title: "Breakdown", Icon: AlertTriangle, head: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-400" },
];

export function AssetStatusColumns() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = MINING_ASSETS.filter((a) => a.status === col.status);
        return (
          <div key={col.status} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div className={cn("flex items-center justify-between border-b px-4 py-2.5", col.head)}>
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <col.Icon className="h-4 w-4" />
                {col.title}
              </span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">{items.length}</span>
            </div>
            <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto scrollbar-thin">
              {items.map((a) => (
                <li key={a.code} className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-slate-50">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", col.dot)} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{a.name}</p>
                    <p className="text-[11px] text-slate-400">{a.code} · {a.type}</p>
                  </div>
                </li>
              ))}
              {items.length === 0 && (
                <li className="px-4 py-6 text-center text-xs text-slate-400">Tidak ada unit</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
