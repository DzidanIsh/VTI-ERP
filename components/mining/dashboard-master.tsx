"use client";

import * as React from "react";
import { Gauge, ClipboardCheck, Boxes, Clock, Fuel, Target, ArrowLeftRight, Loader2 } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Field, Input, Select } from "@/components/ui/field";
import { WeatherWidget } from "@/components/mining/weather-widget";
import { AssetStatusColumns } from "@/components/mining/asset-columns";
import { ProductionTabs } from "@/components/mining/production-tabs";
import { BandingLineChart } from "@/components/charts/charts";
import { MAINTENANCE_TIME } from "@/lib/mock-data/mining";
import { METRIK, type KunciMetrik } from "@/lib/metrik";
import { useOperasi } from "@/lib/store/operasi-store";
import { ringkasan } from "@/lib/productivity";
import { formatNumber, compactNumber } from "@/lib/utils";

interface Serial {
  seri: { tanggal: string; a: number; b: number }[];
  label: { a: string; b: string };
  total: { a: number; b: number };
}

const iso = (d: Date) => d.toLocaleDateString("en-CA");

/**
 * Isi Dashboard Master (arahan 2026-08-11): model Mining Site Dashboard —
 * KPI nyata, cuaca, status aset — ditambah pembanding dua metrik bebas.
 * Dipakai di dua tempat: halaman Produksi > Dashboard Master dan Home
 * (arahan 2026-08-12). API serial hanya untuk pengawas/checker/owner —
 * pemanggil wajib menyaring peran sebelum merender.
 */
export function DashboardMaster() {
  const { ritaseList, units, stockpiles, saldoStockpile } = useOperasi();
  // BRULE-005: hanya angka dari ritase tervalidasi penuh.
  const r = ringkasan(ritaseList, units);
  const saldoTotal = stockpiles.reduce((s, sp) => s + saldoStockpile(sp.id), 0);

  // BBM & downtime bulan berjalan — dihitung server lewat API serial.
  const [bulanIni, setBulanIni] = React.useState<Serial | null>(null);
  React.useEffect(() => {
    const kini = new Date();
    fetch(`/api/dashboard/serial?a=bbm&b=downtime&dari=${kini.toISOString().slice(0, 7)}-01&sampai=${iso(kini)}`)
      .then((x) => x.json())
      .then((s) => !s.error && setBulanIni(s))
      .catch(() => {});
  }, []);

  // Pembanding dua metrik (fitur inti Dashboard Master).
  const [a, setA] = React.useState<KunciMetrik>("tonase");
  const [b, setB] = React.useState<KunciMetrik>("target");
  const [dari, setDari] = React.useState(() => iso(new Date(Date.now() - 29 * 86_400_000)));
  const [sampai, setSampai] = React.useState(() => iso(new Date()));
  const [banding, setBanding] = React.useState<Serial | null>(null);
  const [memuatBanding, setMemuatBanding] = React.useState(true);

  React.useEffect(() => {
    setMemuatBanding(true);
    fetch(`/api/dashboard/serial?a=${a}&b=${b}&dari=${dari}&sampai=${sampai}`)
      .then((x) => x.json())
      .then((s) => setBanding(s.error ? null : s))
      .catch(() => setBanding(null))
      .finally(() => setMemuatBanding(false));
  }, [a, b, dari, sampai]);

  return (
    <div>
      {/* KPI nyata */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Tonase Tervalidasi"
          value={`${formatNumber(r.totalTonase)} t`}
          sub={`${r.pctTarget}% dari target ${compactNumber(r.totalTarget)} t`}
          icon={Gauge}
          accent="brand"
        />
        <StatCard
          label="Ritase Tervalidasi"
          value={`${r.ritaseDisetujui}`}
          sub={`${r.ritaseMenunggu} masih menunggu validasi`}
          icon={ClipboardCheck}
          accent="sky"
          href="/mining/validasi"
        />
        <StatCard
          label="Saldo Stockpile"
          value={`${compactNumber(saldoTotal)} t`}
          sub={`${stockpiles.length} tumpukan`}
          icon={Boxes}
          accent="amber"
        />
        <StatCard
          label="BBM bulan ini"
          value={`${formatNumber(bulanIni?.total.a ?? 0)} L`}
          sub="dari catatan harian unit"
          icon={Fuel}
          accent="violet"
        />
        <StatCard
          label="Downtime bulan ini"
          value={`${formatNumber(bulanIni?.total.b ?? 0, 1)} jam`}
          sub="kejadian yang sudah ditutup"
          icon={Target}
          accent="rose"
        />
      </div>

      {/* Pembanding data — fitur inti Dashboard Master */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-slate-400" /> Banding Data
          </CardTitle>
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-44">
              <Field label="Metrik A (kiri)">
                <Select value={a} onChange={(e) => setA(e.target.value as KunciMetrik)}>
                  {Object.entries(METRIK).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-44">
              <Field label="Metrik B (kanan)">
                <Select value={b} onChange={(e) => setB(e.target.value as KunciMetrik)}>
                  {Object.entries(METRIK).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-36">
              <Field label="Dari">
                <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
              </Field>
            </div>
            <div className="w-36">
              <Field label="Sampai">
                <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
              </Field>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {memuatBanding ? (
            <div className="py-14 text-center text-sm text-slate-400">
              <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> memuat…
            </div>
          ) : banding && banding.seri.length > 0 ? (
            <>
              <BandingLineChart data={banding.seri} namaA={banding.label.a} namaB={banding.label.b} />
              <p className="mt-2 text-center text-xs text-slate-400">
                Total periode — {banding.label.a}:{" "}
                <span className="font-semibold text-slate-600">{formatNumber(banding.total.a, 1)}</span>
                {" · "}{banding.label.b}:{" "}
                <span className="font-semibold text-slate-600">{formatNumber(banding.total.b, 1)}</span>
              </p>
            </>
          ) : (
            <div className="py-14 text-center text-sm text-slate-400">Tidak ada data pada periode ini.</div>
          )}
        </CardContent>
      </Card>

      {/* Cuaca + maintenance */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeatherWidget />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Total Maintenance Time — 7 Hari
            </CardTitle>
            <Badge variant="slate">Ilustratif</Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Aset</TH>
                  <TH>Tipe</TH>
                  <TH className="text-right">Durasi</TH>
                </TR>
              </THead>
              <TBody>
                {MAINTENANCE_TIME.map((m) => (
                  <TR key={m.asset}>
                    <TD className="max-w-[180px]">
                      <span className="block truncate text-[13px] font-medium text-slate-700">{m.asset}</span>
                    </TD>
                    <TD>
                      <Badge variant={m.assetType === "Vehicle" ? "sky" : "violet"}>{m.assetType}</Badge>
                    </TD>
                    <TD className="text-right font-mono text-[13px] font-semibold text-slate-700">{m.duration}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Status aset */}
      <div className="mt-4">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Status Aset <Badge variant="slate">Ilustratif — modul Asset fase 90 hari</Badge>
        </h2>
        <AssetStatusColumns />
      </div>

      {/* Produksi per operasi */}
      <div className="mt-6">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Produksi per Operasi <Badge variant="slate">Ilustratif</Badge>
        </h2>
        <ProductionTabs />
      </div>
    </div>
  );
}
