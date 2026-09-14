"use client";

import { usePathname } from "next/navigation";
import { Construction, ArrowRight } from "lucide-react";
import { findNavLabel, getModuleByPath } from "@/lib/nav";
import { PageHeader } from "./page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ComingSoon() {
  const pathname = usePathname();
  const label = findNavLabel(pathname) ?? "Halaman";
  const module = getModuleByPath(pathname);

  return (
    <div className="p-6">
      <PageHeader title={label} description={`${module.tagline} — PT Vendoura Inti Perkasa`} />
      <Card className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Construction className="h-8 w-8" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{label}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Halaman ini sudah terhubung di navigasi dan akan dibangun pada fase pengembangan
            modul berikutnya. Tata letak, data, dan alur kerja menyusul sesuai roadmap.
          </p>
        </div>
        <Badge variant="brand">
          Roadmap
          <ArrowRight className="h-3 w-3" />
          Fase pendalaman modul {module.name}
        </Badge>
      </Card>
    </div>
  );
}
