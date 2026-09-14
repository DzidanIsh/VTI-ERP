import type { Presensi } from "@prisma/client";
import type { Role } from "@/lib/supabase/client";

/**
 * Tanggal kerja pada zona lokasi tambang (WITA), bukan UTC.
 * Absen jam 07:00 WITA adalah 23:00 UTC hari SEBELUMNYA — memakai UTC
 * menaruh seluruh shift pagi di tanggal yang salah.
 */
export function tanggalKerja(): Date {
  return new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Makassar" }));
}

/** Koordinat opsional dari body — di luar rentang bumi dianggap tidak ada, bukan galat. */
export function koordinat(b: { lat?: unknown; lon?: unknown }): { lat: number | null; lon: number | null } {
  const lat = Number(b?.lat), lon = Number(b?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return { lat: null, lon: null };
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return { lat: null, lon: null };
  return { lat, lon };
}

/** Peran yang boleh melihat presensi seluruh pegawai; sisanya dipaksa ke dirinya sendiri. */
export function bolehPantau(role: Role): boolean {
  return role === "hr" || role === "owner";
}

/** Bentuk keluar API: + durasi menit & status masih bekerja (dihitung server). */
export function sajikan(p: Presensi) {
  return {
    ...p,
    masihBekerja: p.jamPulang === null,
    durasiMenit: p.jamPulang
      ? Math.round((p.jamPulang.getTime() - p.jamMasuk.getTime()) / 60_000)
      : null,
  };
}
