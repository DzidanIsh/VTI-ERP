import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka ke ribuan ala Indonesia: 158110.76 -> "158.110,76" */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format Rupiah singkat: 40000000 -> "Rp40 jt", 250000000 -> "Rp250 jt" */
export function formatRupiah(value: number): string {
  return "Rp" + value.toLocaleString("id-ID");
}

/** Singkatan angka besar: 10100 -> "10,1k", 1500000 -> "1,5jt" */
/** Menit -> "7j 30m". Dipakai daftar presensi. */
export function jamMenit(menit: number | null | undefined): string {
  if (menit === null || menit === undefined) return "—";
  const j = Math.floor(menit / 60);
  const m = Math.round(menit % 60);
  return j > 0 ? `${j}j ${m}m` : `${m}m`;
}

/** Waktu ISO -> "07:30" pada zona waktu lokasi tambang. */
export function jamLokal(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  });
}

export function compactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return (value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "jt";
  if (Math.abs(value) >= 1_000)
    return (value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "k";
  return formatNumber(value);
}
