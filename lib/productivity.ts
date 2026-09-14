import type { Unit, Driver, Vendor } from "@/lib/mock-data/master";
import type { Ritase } from "@/lib/store/operasi-store";

export type Kelas = "produktif" | "andal" | "merugikan";

export function klasifikasi(pct: number): Kelas {
  if (pct >= 95) return "produktif";
  if (pct >= 80) return "andal";
  return "merugikan";
}

export const KELAS_BADGE: Record<Kelas, { label: string; variant: "operative" | "amber" | "rose" }> = {
  produktif: { label: "Produktif", variant: "operative" },
  andal: { label: "Andal", variant: "amber" },
  merugikan: { label: "Merugikan", variant: "rose" },
};

/** BRULE-005: hanya ritase tervalidasi penuh yang boleh masuk perhitungan. */
const tervalidasi = (list: Ritase[]) => list.filter((r) => r.status === "disetujui");

export interface UnitRow {
  id: string; nama: string; tipe: string; target: number; actual: number; pct: number; kelas: Kelas;
}

/** Produktivitas unit angkut: tonase tervalidasi yang dihauling tiap dump truck vs target. */
export function unitProductivity(ritaseList: Ritase[], units: Unit[]): UnitRow[] {
  const sah = tervalidasi(ritaseList);
  return units
    .filter((u) => u.kapasitasM3 > 0)
    .map((u) => {
      const actual = sah.filter((r) => r.unitId === u.id).reduce((s, r) => s + r.tonase, 0);
      const pct = u.targetTonBulan ? (actual / u.targetTonBulan) * 100 : 0;
      return { id: u.id, nama: u.nama, tipe: u.tipe, target: u.targetTonBulan, actual: Math.round(actual), pct: Math.round(pct), kelas: klasifikasi(pct) };
    })
    .sort((a, b) => b.pct - a.pct);
}

export interface OperatorRow { id: string; nama: string; vendor: string; tonase: number; nilai: number; jumlahRitase: number; }

export function operatorProductivity(ritaseList: Ritase[], drivers: Driver[], vendors: Vendor[]): OperatorRow[] {
  const sah = tervalidasi(ritaseList);
  return drivers
    .map((d) => {
      const rows = sah.filter((r) => r.driverId === d.id);
      return {
        id: d.id, nama: d.nama,
        vendor: vendors.find((v) => v.id === d.vendorId)?.nama ?? "-",
        tonase: Math.round(rows.reduce((s, r) => s + r.tonase, 0)),
        nilai: rows.reduce((s, r) => s + r.nilai, 0),
        jumlahRitase: rows.length,
      };
    })
    .filter((r) => r.jumlahRitase > 0)
    .sort((a, b) => b.jumlahRitase - a.jumlahRitase);
}

export interface VendorRow { id: string; nama: string; ritase: number; nilai: number; }

export function vendorRekap(ritaseList: Ritase[], vendors: Vendor[]): VendorRow[] {
  const sah = tervalidasi(ritaseList);
  return vendors
    .filter((v) => v.hargaPerRitase > 0)
    .map((v) => {
      const rows = sah.filter((r) => r.vendorId === v.id);
      return { id: v.id, nama: v.nama, ritase: rows.length, nilai: rows.reduce((s, r) => s + r.nilai, 0) };
    })
    .filter((v) => v.ritase > 0)
    .sort((a, b) => b.nilai - a.nilai);
}

export function ringkasan(ritaseList: Ritase[], units: Unit[]) {
  const sah = tervalidasi(ritaseList);
  const totalTonase = sah.reduce((s, r) => s + r.tonase, 0);
  const totalTarget = units.filter((u) => u.kapasitasM3 > 0).reduce((s, u) => s + u.targetTonBulan, 0);
  return {
    totalTonase: Math.round(totalTonase),
    totalTarget,
    pctTarget: totalTarget ? Math.round((totalTonase / totalTarget) * 100) : 0,
    ritaseDisetujui: sah.length,
    ritaseMenunggu: ritaseList.filter((r) => r.status === "menunggu").length,
    nilaiAP: sah.reduce((s, r) => s + r.nilai, 0),
  };
}
