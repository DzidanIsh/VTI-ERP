import type { Shipment } from "@/lib/store/operasi-store";

export interface Deviasi {
  e2s: number | null; // survei stockpile - estimasi
  s2f: number | null; // final tongkang - survei
  total: number | null; // final - estimasi
  pctTotal: number | null;
}

/** Bentuk minimal yang dibutuhkan — cocok untuk data UI maupun baris Prisma. */
export interface SumberDeviasi {
  tonaseEstimasi: number;
  tonaseSurvei?: number | null;
  tonaseFinal?: number | null;
}

export function deviasi(s: SumberDeviasi): Deviasi {
  const survei = s.tonaseSurvei ?? null;
  const final = s.tonaseFinal ?? null;
  return {
    e2s: survei != null ? survei - s.tonaseEstimasi : null,
    s2f: survei != null && final != null ? final - survei : null,
    total: final != null ? final - s.tonaseEstimasi : null,
    pctTotal: final != null && s.tonaseEstimasi ? ((final - s.tonaseEstimasi) / s.tonaseEstimasi) * 100 : null,
  };
}

export function ringkasanRantai(shipments: Shipment[]) {
  const totalEstimasi = shipments.reduce((a, s) => a + s.tonaseEstimasi, 0);
  const totalSurvei = shipments.reduce((a, s) => a + (s.tonaseSurvei ?? 0), 0);
  const totalFinal = shipments.reduce((a, s) => a + (s.tonaseFinal ?? 0), 0);
  const terjual = shipments.filter((s) => s.status === "terjual");
  const tonaseTerjual = terjual.reduce((a, s) => a + (s.tonaseFinal ?? 0), 0);
  const pendapatan = terjual.reduce((a, s) => a + (s.pendapatan ?? 0), 0);
  // susut hanya dari shipment yang punya tonase final
  const withFinal = shipments.filter((s) => s.tonaseFinal != null);
  const deviasiTotal = withFinal.reduce((a, s) => a + ((s.tonaseFinal ?? 0) - s.tonaseEstimasi), 0);
  const basisFinal = withFinal.reduce((a, s) => a + s.tonaseEstimasi, 0);
  return {
    totalEstimasi, totalSurvei, totalFinal, tonaseTerjual, pendapatan, deviasiTotal,
    pctSusut: basisFinal ? (deviasiTotal / basisFinal) * 100 : 0,
    jumlahShipment: shipments.length,
    jumlahTerjual: terjual.length,
    jumlahAktif: shipments.filter((s) => s.status !== "terjual").length,
  };
}
