import { NextResponse } from "next/server";

/** JSON response yang aman untuk BigInt (pendapatan) — dikirim sebagai number. */
export function json(data: unknown, init?: ResponseInit) {
  const body = JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? Number(v) : v));
  return new NextResponse(body, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
}

export function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

export function notFound(message = "Tidak ditemukan") {
  return json({ error: message }, { status: 404 });
}

export function serverError(e: unknown) {
  const message = e instanceof Error ? e.message : "Kesalahan server";
  return json({ error: message }, { status: 500 });
}

// ---------------------------------------------------------------------
// Pemetaan error PostgreSQL -> HTTP (konsep dari branch draga).
// Aturan bisnis ditegakkan database (CHECK, trigger, fungsi PL/pgSQL);
// SQLSTATE dari RAISE EXCEPTION diterjemahkan ke status yang bermakna
// supaya klien tidak melihat "500 Internal Error" untuk pelanggaran aturan.
// ---------------------------------------------------------------------

const STATUS_SQLSTATE: Record<string, number> = {
  P0002: 404, // no_data_found — ritase tidak ditemukan
  "42501": 403, // insufficient_privilege — peran tidak berwenang untuk tahap ini
  "23000": 409, // integrity_constraint — sudah diproses / terkunci trigger
  "23505": 409, // unique_violation
  "23503": 400, // foreign_key_violation
  "23514": 400, // check_violation
  "23502": 400, // not_null — alasan tolak kosong
};

/** Pesan ramah per nama constraint — pesan mentah Postgres membocorkan struktur tabel. */
const PESAN_CONSTRAINT: Record<string, string> = {
  ritase_status_tahap: "Status ritase tidak sesuai tahap validasinya.",
  ritase_tolak_wajib_alasan: "Alasan penolakan wajib diisi.",
  ritase_snapshot_positif: "Kapasitas, density, dan tonase harus lebih dari 0.",
  ritase_tonase_konsisten: "Tonase tidak cocok dengan kapasitas vessel × density.",
  ritase_satu_baris_satu_rit: "Satu baris = satu ritase; nilai harus sama dengan harga per ritase.",
  rencana_periode_format: 'Format periode salah: bulanan "2026-08", tahunan "2026".',
  bbm_liter_positif: "Liter BBM harus lebih dari 0.",
  catatan_hm_non_negatif: "HM tidak boleh negatif.",
};

/**
 * Terjemahkan error query mentah Prisma (P2010) menjadi respons HTTP.
 * Return null bila bukan error database yang dikenal — pemanggil lanjut ke serverError.
 */
export function dbError(e: unknown) {
  const meta = (e as { meta?: { code?: unknown; message?: unknown } })?.meta;
  let code = String(meta?.code ?? "");
  let raw = String(meta?.message ?? "");
  if (!code) {
    // Error dari kueri ORM Prisma (bukan $queryRaw): SQLSTATE tidak ada di
    // meta, tertanam sebagai teks `PostgresError { code: "23000", message: ... }`.
    const m = String((e as Error)?.message ?? "");
    code = /code:\s*"([0-9A-Z]{5})"/.exec(m)?.[1] ?? "";
    raw = /message:\s*"((?:[^"\\]|\\.)*)"/.exec(m)?.[1] ?? m;
  }
  const status = STATUS_SQLSTATE[code];
  if (!status) return null;
  const constraint = Object.keys(PESAN_CONSTRAINT).find((c) => raw.includes(c));
  // pesan RAISE EXCEPTION dari fungsi PL/pgSQL sudah Bahasa Indonesia — tampil apa adanya
  const pesan = constraint
    ? PESAN_CONSTRAINT[constraint]
    : raw.replace(/^[\s\S]*?ERROR:\s*/, "").split("\n")[0] || "Aturan bisnis ditolak database";
  return json({ error: pesan }, { status });
}

/** Parse tanggal dari string ISO (yyyy-mm-dd) — form UI memakai input type=date. */
export function parseTanggal(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

const SUMBER_SAH = ["web", "asisten", "telegram"];
/** Kanal asal aksi untuk jejak audit — nilai di luar daftar diabaikan agar tidak bisa disisipi client. */
export const sumberAksi = (v: unknown) => (typeof v === "string" && SUMBER_SAH.includes(v) ? v : "web");

export function isPosInt(v: unknown, max = Number.MAX_SAFE_INTEGER): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= max && Number.isInteger(v);
}

export function isPosNum(v: unknown, max = Number.MAX_SAFE_INTEGER): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 && v <= max;
}
